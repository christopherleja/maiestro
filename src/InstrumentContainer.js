import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css';
import Instrument from './Instrument';
import SongBtn from './SongBtn'
import { instrument } from 'soundfont-player';

// webkitAudioContext fallback needed to support Safari
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const soundfontHostname = 'https://d1pzp51pvbm36p.cloudfront.net';

class InstrumentContainer extends React.Component {
  state = {
    title: "",
    instrument: "",
    loadedSongs: [],
    song: []
  };

  handleSongLoad = (song) => {
    this.setState({
      song: song,
      instrument: song.tracks[0].instrument
    })
  }

  handleInstrumentChange = (instrumentName) => {
    this.setState({
      instrument: instrumentName,
    })
  }

  handleLoading = () => {
    if (this.props.currentUser){
    fetch(this.props.url + `/users/${this.props.currentUser.id}/songs`, {
      credentials: "include"
    })
    .then(response => response.json())
    .then(songs => {
      this.setState({
        loadedSongs: songs
      })
    });
  } else {
    alert("Please sign in to save or load songs")
  }
}

  renderLoadedSongs = () => {
    if (this.state.loadedSongs.length > 0){
      return this.state.loadedSongs.map(song => {
      return (
        <SongBtn key={song.id} song={song} toggleDisplayedButtons={this.toggleDisplayedButtons} 
        url={this.props.url} currentUser={this.props.currentUser} handleSongLoad={this.handleSongLoad}/>
      )
    }
  )}
  }

  toggleDisplayedButtons = (id) => {
    let updatedLoadedSongs = this.state.loadedSongs.filter(song => {
      if (song.id !== id)
      return song
    })
      this.setState({
        loadedSongs: updatedLoadedSongs
      })
  }

  handleTitle = (event) => {
    this.setState({
      title: event.target.value
    })
  }

  render() {
    const songBtns = this.renderLoadedSongs()
    return (
      <>
      <div>
        <Instrument 
        soundfontHostname={soundfontHostname} audioContext={audioContext} 
        handleInstrumentChange={this.handleInstrumentChange} currentUser={this.props.currentUser}
        title={this.state.title} url={this.props.url} loadedSongs={this.state.loadedSongs} 
        handleLoading={this.handleLoading} song={this.state.song}/>
        </div>
        <div className="mt-5">
          <input onChange={this.handleTitle} value={this.state.title !== "" ? this.state.title: "untitled"}/>
        </div>
        <div className="mt-5">
          {songBtns}
        </div>
      </>
    );
  }
}

export default InstrumentContainer