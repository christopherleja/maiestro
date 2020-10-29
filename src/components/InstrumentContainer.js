import React from 'react';
import 'react-piano/dist/styles.css';
import Instrument from './Instrument';
import SongBtn from './SongBtn'
import swal from 'sweetalert';


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
      instrument: song.tracks[0].instrument,
      title: song.title
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
      let userSongs = []
      songs.map(song => {
        if (song.user.username === this.props.currentUser.username){
          userSongs.push(song)
          return userSongs
        } else {
          return []
        }
      })
      this.setState({
        loadedSongs: userSongs
      }, () => {
        if (this.state.loadedSongs.length === 0){
          swal("It doesn't look like you've saved any songs yet")
        }
      })
    });
  } else {
    swal("Please sign in to save or load songs")
  }
}

  renderLoadedSongs = () => {
    if (this.props.currentUser && this.state.loadedSongs.length > 0){
      return this.state.loadedSongs.map(song => {
      return (
        <SongBtn key={song.id} 
          song={song} 
          toggleDisplayedButtons={this.toggleDisplayedButtons} 
          url={this.props.url} 
          currentUser={this.props.currentUser} 
          handleSongLoad={this.handleSongLoad}
        />
      )
    }
  )}
  }

  handleClearLoadedSongs = () => {
    this.setState({
      loadedSongs: []
    })
  }

  toggleDisplayedButtons = (id) => {
    let updatedLoadedSongs = this.state.loadedSongs.filter(song => {
      if (song.id !== id) return song
    })
      this.setState({
        loadedSongs: updatedLoadedSongs
      })
    return;
  }

  handleTitle = (event) => {
    this.setState({
      title: event.target.value
    })
  }

  render() {
    const songBtns = this.renderLoadedSongs()
    const { currentUser, url } = this.props
    return (
      <>
      <div className="container">
        <div className="title-card-container">
          <input className="title title-card" 
            onChange={this.handleTitle} 
            value={this.state.title}
            placeholder="Untitled"
            />
  
          <small className="instructions title-card">
            Use the mouse or keyboard to play. 
            Move shortcuts around by using left and right arrow keys.
          </small>
        </div>
        <Instrument 
          soundfontHostname={soundfontHostname} 
          audioContext={audioContext} 
          handleInstrumentChange={this.handleInstrumentChange} 
          currentUser={currentUser}
          title={this.state.title} 
          url={url} 
          loadedSongs={this.state.loadedSongs} 
          handleLoading={this.handleLoading} 
          song={this.state.song} 
          handleClearLoadedSongs={this.handleClearLoadedSongs}
        />
        </div>
        <div className="mt-5">
        </div>
        <div className="song-btn-container">
          {songBtns}
        </div>
      </>
    );
  }
}

export default InstrumentContainer