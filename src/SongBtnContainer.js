import React from 'react'
import SongBtn from './SongBtn'

const SongBtnContainer = () => {

  const renderLoadedSongs = () => {
    if (this.props.loadedSongs.length > 0){
      
      return this.props.loadedSongs.map(song => {
        return <SongBtn id={song.id} onClick={this.props.loadSong}>{song.title}</SongBtn>
      })
    }
  }

  
    return (
      {renderLoadedSongs}
    )
  }



export default SongBtnContainer