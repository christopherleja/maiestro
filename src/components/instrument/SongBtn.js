import React from 'react'
import swal from 'sweetalert'

const SongBtn = (props) => {

  const { currentUser, handleSongLoad, song, toggleDisplayedButtons, url } = props

  const handleDelete = (id) => {
    fetch(url + `/users/${currentUser.id}/songs/${id}`, 
    {method: 'DELETE',
    credentials: "include"
    })
    .then(res => res.json())
    .then(res => {
      toggleDisplayedButtons(id)
    })
    .catch(err => {
      swal(`Sorry, we couldn't delete ${song.title} at this time. Please try again!`)
    })
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
      <div className="song-btn-div">
        <div className="song-btn" 
          key={song.id} 
          id={song.id} 
          onClick={()=> loadSong(song.id)} > 
            Load {song.title}
        </div>
        <button className="song-btn delete-btn" 
          onClick={() => handleDelete(song.id) }>
            Delete {song.title}
        </button>
      </div>
      )
    }

export default SongBtn