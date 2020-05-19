import React from 'react'

const SongBtn = (props ) => {
    return (
      <div className="song-btn" onClick={props.handleLoading} id={props.id}> 
        <h3>{props.title}</h3>
        <p>{props.instrument}</p>
      </div>
    )
    }

export default SongBtn