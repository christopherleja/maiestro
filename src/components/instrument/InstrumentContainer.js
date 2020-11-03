import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import 'react-piano/dist/styles.css';
import Instrument from './Instrument';
import SongBtn from './SongBtn'

import config from '../../constants'

import { changeTitle, loadAllSongs, loadSong, } from '../../store/songReducer'
import Pager from './Pager';

const InstrumentContainer = () => {
  const song = useSelector(state => state.song)
  const currentUser = useSelector(state => state.user.currentUser)
  const url = config.url

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

  const renderLoadedSongs = () => {
    const { loadedSongs, loadedIndex } = song
    const pagedSongs = loadedSongs.slice(loadedIndex, loadedIndex + 9)
    if (currentUser && pagedSongs.length){
      return pagedSongs.map(song => {
        return (
          <SongBtn key={song.id} 
            song={song} 
            toggleDisplayedButtons={toggleDisplayedButtons} 
            url={url} 
            currentUser={currentUser} 
            handleSongLoad={handleSongLoad}
          />
        )
      }
    )}
  }

  const toggleDisplayedButtons = (id) => {
    const updatedLoadedSongs = song.loadedSongs.filter(song => {
      if (song.id !== id) return song
    })
      dispatch({ type: loadAllSongs.type, payload: updatedLoadedSongs })
  }

  const handleTitle = (event) => {
    dispatch({type: changeTitle.type, payload: event.target.value })
  }

  const songBtns = renderLoadedSongs()
  return (
    <>
    {song.loadedSongs.length ? 
    <div className="song-btn-container">
        {songBtns}
        <Pager /> 
    </div> : null }
    <div className="backdrop">
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
        
        <Instrument />
        </div>
      </div>
    </>
  );
}

export default InstrumentContainer