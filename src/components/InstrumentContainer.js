import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import 'react-piano/dist/styles.css';
import Instrument from './Instrument';
import SongBtn from './SongBtn'
import swal from 'sweetalert';

import { loadSong, loadAllSongs, clearLoadedSongs, changeTitle, changeInstrument } from '../store/songReducer'


// webkitAudioContext fallback needed to support Safari
// To do: export these to ENV variable file?
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const soundfontHostname = 'https://d1pzp51pvbm36p.cloudfront.net';

const InstrumentContainer = () => {
  const { song, user } = useSelector(state => state)
  // const user = useSelector(state => state.user)
  const dispatch = useDispatch()

  const handleSongLoad = (songObj) => {
    const last = songObj.notes.length - 1
    const totalTime = songObj.notes[last].endTime

    dispatch({ type: loadSong.type, payload: {
      notes: songObj.notes,
      totalTime: totalTime,
      instrument: songObj.tracks[0].instrument,
      title: songObj.title
      }
    })
  }

    const handleLoading = () => {
      const { currentUser, url } = user
      if (currentUser){
        fetch(url + `/users/${currentUser.id}/songs`, {
          credentials: "include"
        })
        .then(r => r.json())
        .then(songs => {
          dispatch({ type: loadAllSongs.type, payload: songs })
      }, () => {
        if (song.loadedSongs.length === 0){
          swal("It doesn't look like you've saved any songs yet")
        }
      });
    } else {
      swal("Please sign in to save or load songs")
    }
  }

  const renderLoadedSongs = () => {
    if (user.currentUser && song.loadedSongs.length){
      return song.loadedSongs.map(song => {
        return (
          <SongBtn key={song.id} 
            song={song} 
            toggleDisplayedButtons={toggleDisplayedButtons} 
            url={user.url} 
            currentUser={user.currentUser} 
            handleSongLoad={handleSongLoad}
          />
        )
      }
    )}
  }

  const handleClearLoadedSongs = () => {
    dispatch({ type: clearLoadedSongs.type, payload: [] })
  }

  const toggleDisplayedButtons = (id) => {
    let updatedLoadedSongs = song.loadedSongs.filter(song => {
      if (song.id !== id) return song
    })
      dispatch({ type: loadAllSongs.type, payload: updatedLoadedSongs })
    return;
  }

  const handleInstrumentChange = (instrument) => {
    dispatch({ type: changeInstrument.type, payload: instrument.name })
  }

  const handleTitle = (event) => {
    dispatch({type: changeTitle.type, payload: event.target.value })
  }

  const songBtns = renderLoadedSongs()
  return (
    <>
    <div className="container">
      <div className="title-card-container">
        <input className="title title-card" 
          onChange={handleTitle} 
          value={song.title}
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
        handleInstrumentChange={handleInstrumentChange} 
        loadedSongs={song.loadedSongs} 
        handleLoading={handleLoading} 
        handleClearLoadedSongs={handleClearLoadedSongs}
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

export default InstrumentContainer