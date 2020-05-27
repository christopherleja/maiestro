import React from 'react'

const SongBtn = (props) => {

  let { song, handleSongLoad, toggleDisplayedButtons, url, currentUser } = props

  const handleDelete = (id) => {
    fetch(url + `/users/${currentUser.id}/songs/${id}`, 
    {method: 'DELETE',
    credentials: "include"
    })
    .then(res => res.json())
    .then(res => {
      toggleDisplayedButtons(id)
    })
    .catch(err => console.error(err))
  }

  const loadSong = (id) => {
    fetch(url + `/users/${currentUser.id}/songs/${id}`, {
      credentials: "include"
    })
    .then(response => response.json())
    .then(song => {
      handleSongLoad(song)
    });
  }

    return (
      <div>
        <div className="song-btn" key={song.id} id={song.id} onClick={()=> {loadSong(song.id)}}>Load {song.title}</div>
        <button className="delete-btn" onClick={() => handleDelete(song.id)}> Delete {song.title}</button>
      </div>
      )
    }

export default SongBtn