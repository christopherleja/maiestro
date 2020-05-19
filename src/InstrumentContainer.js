import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css';
import CustomPiano from './CustomPiano';
import SongBtnContainer from './SongBtnContainer'

// webkitAudioContext fallback needed to support Safari
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const soundfontHostname = 'https://d1pzp51pvbm36p.cloudfront.net';

const URL = "http://localhost:3000/songs"

const noteRange = {
  first: MidiNumbers.fromNote('c3'),
  last: MidiNumbers.fromNote('f4'),
};
const keyboardShortcuts = KeyboardShortcuts.create({
  firstNote: noteRange.first,
  lastNote: noteRange.last,
  keyboardConfig: KeyboardShortcuts.HOME_ROW,
});

class InstrumentContainer extends React.Component {
  state = {
    recording: {
      mode: 'RECORDING',
      events: [],
      currentTime: 0,
      currentEvents: [],
    },
    title: "",
    instrument: "",
    loadedSongs: []
  };

  constructor(props) {
    super(props);

    this.scheduledEvents = [];
  }

  getRecordingEndTime = () => {
    if (this.state.recording.events.length === 0) {
      return 0;
    }
    return Math.max(
      ...this.state.recording.events.map(event => event.time + event.duration),
    );
  };

  handleInstrumentChange = (instrumentName) => {
    this.setState({
      instrument: instrumentName,
    })
  }

  setRecording = value => {
    this.setState({
      recording: Object.assign({}, this.state.recording, value),
    });
  };

  handleSave = () => {
    let song = {
      user_id: 1,
      title: this.state.title,
      tracks: [],
      instrument: this.state.instrument,
      notes: this.state.recording.events
    }
    fetch(URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
      },
      body: JSON.stringify(song),
    })
    .then(response => response.json())
    .then(song => {
      console.log('Success:', song);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  handleLoading = () => {
    fetch(URL)
    .then(response => response.json())
    .then(songs => {
      this.setState({
        loadedSongs: songs
      })
      this.renderLoadedSongs()
    });
  }

  renderLoadedSongs = () => {
    if (this.state.loadedSongs.length > 0){
      // console.log(this.state.loadedSongs)
      return this.state.loadedSongs.map(song => {
        // console.log(song.id)
      return (<div>
      <div key={song.id} id={song.id} onClick={()=> {this.loadSong(song.id)}}>{song.title}</div>
        <button onClick={() => this.handleDelete(song.id)}> Delete </button>
      </div>
      )})
    }
  }

  loadSong = (songId) => {
    fetch(URL + `/${songId}`)
    .then(response => response.json())
    .then(song => {
      console.log("song is ", song)
      console.log("instrument is ", song.tracks[0])
      console.log("state is ", this.state.recording)
      let newRecording = {...this.state.recording}
      newRecording.events = song.notes
      newRecording.mode = 'PLAYING'
      this.setState({
        title: song.title,
        instrument: song.tracks[0].instrument,
        recording: newRecording
      }, () => console.log("state is ",this.state))
    });
  }

  handleDelete = (id) => {
    fetch(URL + `/${id}`, 
    {method: 'DELETE'})
    .then(res => res.json())
    .then(res => {
      let updatedLoadedSongs = this.state.loadedSongs.filter(song => {
        if (song.id !== id)
        return song
      })
        this.setState({
          loadedSongs: updatedLoadedSongs
        })
    })
    .catch(err => console.error(err))
}

  handleTitle = (event) => {
    this.setState({
      title: event.target.value
    })
  }

  onClickPlay = () => {
    this.setRecording({
      mode: 'PLAYING',
    });
    const startAndEndTimes = _.uniq(
      _.flatMap(this.state.recording.events, event => [
        event.time,
        event.time + event.duration,
      ]),
    );
    startAndEndTimes.forEach(time => {
      this.scheduledEvents.push(
        setTimeout(() => {
          const currentEvents = this.state.recording.events.filter(event => {
            return event.time <= time && event.time + event.duration > time;
          });
          this.setRecording({
            currentEvents,
          });
        }, time * 1000),
      );
    });
    // Stop at the end
    setTimeout(() => {
      this.onClickStop();
    }, this.getRecordingEndTime() * 1000);
  };

  onClickStop = () => {
    this.scheduledEvents.forEach(scheduledEvent => {
      clearTimeout(scheduledEvent);
    });
    this.setRecording({
      mode: null,
      currentEvents: [],
    });
  };

  onClickClear = () => {
    this.onClickStop();
    this.setRecording({
      events: [],
      mode: null,
      currentEvents: [],
      currentTime: 0,
    });
  };

  handleRecording = () => {
    this.setRecording({
      events: [],
      mode: 'RECORDING',
      currentEvents: [],
      currentTime: 0,
    })
  }

  render() {
    const songBtns = this.renderLoadedSongs()
    return (
      <>
      <div>
        <CustomPiano recording={this.state.recording} setRecording={this.setRecording}
        soundfontHostname={soundfontHostname} audioContext={audioContext} 
        handleInstrumentChange={this.handleInstrumentChange}/>
        </div>
        <div className="mt-5">
          <button onClick={this.onClickPlay}>Play</button>
          <button onClick={this.onClickStop}>Stop</button>
          <button onClick={this.onClickClear}>Clear</button>
          <button onClick={this.handleRecording}>Record</button>
          <button onClick={this.handleSave}>Save</button>
          <input onChange={this.handleTitle} value={this.state.title !== "" ? this.state.title: "untitled"}/>
          <button onClick={this.handleLoading}>Load</button>
        </div>
        <div className="mt-5">
          {songBtns}
        </div>
      </>
    );
  }
}

export default InstrumentContainer