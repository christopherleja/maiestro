import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { Piano, KeyboardShortcuts } from 'react-piano';
import * as mm from '@magenta/music'
import DimensionsProvider from './DimensionsProvider';
import InstrumentListProvider from './InstrumentListProvider';
import SoundfontProvider from './SoundfontProvider';
import PianoConfig from './PianoConfig';
import swal from 'sweetalert';

import { 
  clearLoadedSongs, 
  clearRecordedNotes, 
  loadAllSongs,
  startPlaying, 
  startRecording, 
  stopPlaying, 
  stopRecording,
  toggleIsLoading,
  updateConfig,
} from '../../store/songReducer'

import config from '../../constants'


const Instrument = (props) => {
  const { song, user: { currentUser }} = useSelector(state => state)
  const { url, melodyRNN, rnnPlayer } = config
  const dispatch = useDispatch()

  useEffect(() => {
    melodyRNN.initialize()
  }, [])

  // to do: separate fetches to separate file/maybe use axios? Make this less ugly
  const handleSave = () => {
    // make sure song object is eligible to be saved
    if (currentUser && song.title.length){
      
      let melody = {
        user_id: currentUser.id,
        title: song.title,
        tracks: [],
        instrument: song.config.instrumentName,
        notes: song.recordedNotes.notes
      }
      fetch(url + `/users/${currentUser.id}/songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          },
        credentials: "include",
        body: JSON.stringify(melody),
        })
        .then(r => r.json())
        .then(res => {
          swal(`${res.title} was saved successfully`);
        })
        .catch((err) => {
          swal(`There was an issue saving ${song.title}. Please try again`);
        });
      } else if (currentUser && !song.title.length) {
        swal("Please enter a title before saving your song")
      } else {
        swal("Please sign in to save or load songs")
      }
  }

  const handleLoading = () => {
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

  const handlePlay = () => {
    if (!song.recordedNotes.totalTime) {
      return swal("There's nothing to play yet. Try recording something first.")
    }
    dispatch({ type: !song.isPlaying ? startPlaying.type : stopPlaying.type })
  } 

  const handleRecording = () => {
    dispatch({ type: !song.recording ? startRecording.type : stopRecording.type })
  }

  const handleClear = () => dispatch({ type: clearRecordedNotes.type })

  const handleDuet = () => {
    if (song.recordedNotes.notes.length){
      // begin configuration for magenta from recorded notes in state
      const notesToSequence = song.recordedNotes.notes.map(note => {
        const newNote = {pitch: note.pitch}
        // converts note start time to 'steps' which are what magenta expects
        const newTime = Math.round((note.time * 4) / 4).toFixed(2)
        newNote.time = Math.round((newTime / 1000) * 4)
        
        // same as above, but for note end times
        const newEndTime = Math.round((note.endTime * 4) / 4).toFixed(2)
        newNote.endTime = Math.round((newEndTime / 1000) * 4)

        return newNote
      })

      // quantize the n for magenta, using their functions
      let last = notesToSequence.length - 1
      const quantizeRecording = mm.sequences.quantizeNoteSequence(notesToSequence, 4)
      quantizeRecording.notes = notesToSequence
      quantizeRecording.totalQuantizedSteps = notesToSequence[last].endTime

      // send the quantized sequence to the neural network
      playDuet(quantizeRecording)
    } else {
      swal("You have to record a melody before activating duet mode")
    }
  }

  const playDuet = async (sequence) => {
    if (rnnPlayer.isPlaying()) {
      return rnnPlayer.stop()
    } else {
      // to do: allow user to change these?
      // rnnSteps controls length of the response: 128 steps is roughly 15 seconds
      let rnnSteps = 128;
      
      // rnnTemp controls how random the response is: usually between 0-2. 
      // higher value means more random
      let rnnTemp = 1;

      dispatch({ type: toggleIsLoading.type, payload: true })
      const sample = await melodyRNN.continueSequence(sequence, rnnSteps, rnnTemp)
      
      dispatch({ type: toggleIsLoading.type, payload: false })
      rnnPlayer.start(sample)
    }
  }

  const clearLoaded = () => dispatch({ type: clearLoadedSongs.type })

  const keyboardShortcuts = KeyboardShortcuts.create({
    firstNote: song.config.noteRange.first + song.config.keyboardShortcutOffset,
    lastNote: song.config.noteRange.last + song.config.keyboardShortcutOffset,
    keyboardConfig: KeyboardShortcuts.HOME_ROW,
  });

  const loaded = song.loadedSongs.length 

  return (
    <SoundfontProvider
      render={({ isLoading, playNote, stopNote, stopAllNotes }) => (
        <div>
            <div className="text-center">
            <div style={{ color: '#777' }}>
            </div>
          </div>
          <div className="btn-container">
            <button className="instrument-btn" 
              onClick={handlePlay}>
                {song.playing ? "Stop" : "Play" }
            </button>
            <button className="instrument-btn" 
              onClick={handleRecording}>
                {song.recording ? "Stop" : "Record" }
            </button>
            <button className="instrument-btn" 
              onClick={handleClear}>
                Clear
            </button>
            <button className="instrument-btn" 
              onClick={handleDuet}>
                Duet
            </button>
            <button className="instrument-btn" 
              onClick={handleSave}>
                Save
            </button>
            <button className="instrument-btn" 
              onClick={loaded ? clearLoaded : handleLoading}>{loaded ? "Clear Loaded" : "Load"}
            </button>
          </div>
          <div className="mt-4">
            <DimensionsProvider>
              {({ containerWidth }) => (
                <Piano
                  noteRange={song.config.noteRange}
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
                hostname={props.soundfontHostname}
                render={(instrumentList) => (
                  <PianoConfig
                    config={song.config}
                    setConfig={(config) => {
                      dispatch({type: updateConfig.type, payload: Object.assign({}, song.config, config),
                      });
                      stopAllNotes();
                    }}
                    instrumentList={instrumentList || [song.config.instrumentName]}
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


export default Instrument;
