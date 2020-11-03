import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateLoadedIndex } from '../../store/songReducer'

const Pager = () => {

  const total = useSelector(state => state.song.loadedSongs.length);
  const startIndex = useSelector(state => state.song.loadedIndex);
  const dispatch = useDispatch();

  const pageButtons = [];

  const numPages = Math.ceil(total / 9);

  for (let pageIndex = startIndex; pageIndex < numPages; pageIndex++){
    pageButtons.push(
      <button 
        className="page-btn"
        key={pageIndex}
        disabled={startIndex === pageIndex * 9}
        onClick={() => dispatch({type: updateLoadedIndex.type, payload: (pageIndex * 9)})}
        > {pageIndex + 1} 
      </button>
    )
  }
  return (
    <div className="pager">
      <button
        className="page-btn"
        disabled={startIndex <= 0}
        onClick={() => dispatch({type: updateLoadedIndex.type, payload: startIndex - 9 })}
      > Prev
      </button>
      
      {pageButtons}
      
      <button
        className="page-btn"
        disabled={startIndex + 9 >= total}
        onClick={() => dispatch({type: updateLoadedIndex.type, payload: startIndex + 9 })}
      > Next
      </button> 
    </div>
  );
}

export default Pager;