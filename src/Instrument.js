import React, { Component } from 'react';
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import * as mm from '@magenta/music'
import DimensionsProvider from './DimensionsProvider';
import InstrumentListProvider from './InstrumentListProvider';
import SoundfontProvider from './SoundfontProvider';
import PianoConfig from './PianoConfig';

class Instrument extends React.Component {
  state = {
    recordedNotes: [],
    config: {
      instrumentName: 'acoustic_grand_piano',
      noteRange: {
        first: MidiNumbers.fromNote('c3'),
        last: MidiNumbers.fromNote('c5'),
      },
      keyboardShortcutOffset: 0,
      playing: false,
      time: 0,
      recording: false,
      loadedSongs: []
    },
  };
  
  magentaCheckpoint = "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn"
  melodyRNN = new mm.MusicRNN(this.magentaCheckpoint) 
  rnnPlayer = new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus')
  
  handleSave = () => {
    if (this.props.currentUser && this.props.title !== ""){
    let song = {
      user_id: this.props.currentUser.id,
      title: this.props.title,
      tracks: [],
      instrument: this.state.config.instrumentName,
      notes: this.state.recordedNotes
    }
    fetch(this.props.url + `/users/${this.props.currentUser.id}/songs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        },
      credentials: "include",
      body: JSON.stringify(song),
      })
      .then(response => response.json())
      .then(song => {
        console.log('Success:', song);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    } else if (this.props.currentUser && this.props.title === "") {
      alert("Please enter a title before saving your song")
    } else {
      alert("Please sign in to save or load songs")
    }
  }

  componentDidMount = () => {
    this.melodyRNN.initialize()
  }

  handlePlay = () => {
    if (!this.state.playing && this.state.recordedNotes.length > 1){
      this.setState({
        playing: !this.state.playing,
        time: Date.now()
      })
    } else if (this.state.playing) {
      this.setState({
        playing: !this.state.playing
      })
    } else if (this.state.recordedNotes.length < 1){
      alert("There's nothing to play yet. Try recording something first.")
    }
  } 

  handleRecording = () => {
    if (!this.state.recording){
      this.setState({
        time: Date.now(),
        recording: !this.state.recording
      })
    } else {
      this.setState({
        recording: !this.state.recording
      })
    }
  }

  handleRecordNoteStart = (note) => {
    this.setState({
      recordedNotes: [...this.state.recordedNotes.concat(note)]
    })
  }

  handleRecordNoteEnd = (noteObj) => {
    let newNotes = this.state.recordedNotes.map(note => {
      if (note.pitch === noteObj.pitch && !note.endTime){
        note.endTime = noteObj.endTime
        return note
      } else {
        return note
      }
    })
    this.setState({
      recordedNotes: newNotes
    })
  }

  stopPlaying = () => {
    this.setState({
      playing: false
    })
  }

  handleClear = () => {
    this.setState({
      recordedNotes: []
    })
  }

  handleDuet = () => {
    if (this.state.recordedNotes.length > 0){
      let copy = [...this.state.recordedNotes]
      const notesToSequence = []
      const magentaRecordings = copy.map(note => {
        let newNote = {pitch: note.pitch}
        let newTime = Math.round((note.time * 4) / 4).toFixed(2) 
        newNote.time = Math.round((newTime / 1000) * 4)
        let newEndTime = Math.round((note.endTime * 4) / 4).toFixed(2)
        newNote.endTime = Math.round((newEndTime / 1000) * 4)
        notesToSequence.push(newNote)
        return notesToSequence
      })
      console.log(notesToSequence)
      let last = notesToSequence.length - 1
      const quantizeRecording = mm.sequences.quantizeNoteSequence(notesToSequence, 4)
      quantizeRecording.notes = notesToSequence
      quantizeRecording.totalQuantizedSteps = notesToSequence[last].endTime
      this.playDuet(quantizeRecording)
    } else {
      alert("You have to record a melody before activating duet mode")
    }
  }

  playDuet = (sequence) => {
    if (this.rnnPlayer.isPlaying()) {
      this.rnnPlayer.stop()
      return
    } else {
      let rnnSteps = 128;
      let rnnTemp = 1
      this.melodyRNN
      .continueSequence(sequence, rnnSteps, rnnTemp)
      .then((sample => {
        this.rnnPlayer.start(sample)
      }))
    }
  }

  handlePlayingRecordedNotes = () => {
    if (!this.state.playing){
      return
    } else {
      let copy = [...this.state.recordedNotes]
      let sequence = {notes: [], totalTime: null}
      let playingNotes = copy.map(note => {
        note.duration = (note.endTime - note.time)
        sequence.notes.push({pitch: note.pitch, start: note.time, duration: note.duration})
        return sequence
      })
      const lastNote = sequence.notes.length - 1
      sequence.totalTime = sequence.notes[lastNote].start + sequence.notes[lastNote].duration
      return sequence
    }
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (prevProps.song !== this.props.song){
      let updatedConfig = {...this.state.config}
      updatedConfig.instrumentName = this.props.song.tracks[0].instrument 
      this.setState({
        recordedNotes: this.props.song.notes,
        config: updatedConfig
      })
    }
  }

  render() {
    const keyboardShortcuts = KeyboardShortcuts.create({
      firstNote: this.state.config.noteRange.first + this.state.config.keyboardShortcutOffset,
      lastNote: this.state.config.noteRange.last + this.state.config.keyboardShortcutOffset,
      keyboardConfig: KeyboardShortcuts.HOME_ROW,
    });
    const loaded = this.props.loadedSongs.length > 0 
    return (
      <SoundfontProvider
        time={this.state.time}
        stopPlaying={this.stopPlaying}
        recording={this.state.recording}
        recordedNotes={this.state.recordedNotes}
        handleInstrumentChange={this.props.handleInstrumentChange}
        handleRecordNoteStart={this.handleRecordNoteStart}
        handleRecordNoteEnd={this.handleRecordNoteEnd}
        handlePlayingRecordedNotes={this.handlePlayingRecordedNotes}
        audioContext={this.props.audioContext}
        instrumentName={this.state.config.instrumentName}
        hostname={this.props.soundfontHostname}
        render={({ isLoading, playNote, stopNote, stopAllNotes }) => (
          <div>
              <div className="text-center">
                {/* <p className="">Use the mouse or keyboard to play!</p> */}
              <div style={{ color: '#777' }}>
              </div>
            </div>
            <div className="btn-container">
              <button className="instrument-btn" onClick={this.handlePlay}>{this.state.playing ? "Stop" : "Play" }</button>
              <button className="instrument-btn" onClick={this.handleRecording}>{this.state.recording ? "Stop" : "Record" }</button>
              <button className="instrument-btn" onClick={this.handleClear}>Clear</button>
              <button className="instrument-btn" onClick={this.handleDuet}>Duet</button>
              <button className="instrument-btn" onClick={this.handleSave}>Save</button>
              <button className="instrument-btn" onClick={loaded ? this.props.handleClearLoadedSongs : this.props.handleLoading}>{loaded ? "Clear Loaded" : "Load"}</button>
            </div>
            <div className="mt-4">
              <DimensionsProvider>
                {({ containerWidth }) => (
                  <Piano
                    noteRange={this.state.config.noteRange}
                    keyboardShortcuts={keyboardShortcuts}
                    playNote={playNote}
                    stopNote={stopNote}
                    disabled={isLoading}
                    width={containerWidth}
                  />
                )}
              </DimensionsProvider>
            </div>
            <div className="row mt-5">
              <div className="col-lg-8 offset-lg-2">
                <InstrumentListProvider
                  hostname={this.props.soundfontHostname}
                  render={(instrumentList) => (
                    <PianoConfig
                      config={this.state.config}
                      setConfig={(config) => {
                        this.setState({
                          config: Object.assign({}, this.state.config, config),
                        });
                        stopAllNotes();
                      }}
                      instrumentList={instrumentList || [this.state.config.instrumentName]}
                      keyboardShortcuts={keyboardShortcuts}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        )}
      />
    );
  }
}

export default Instrument;
