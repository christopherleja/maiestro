import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import * as mm from '@magenta/music'
import DimensionsProvider from '../DimensionsProvider';
import InstrumentListProvider from '../InstrumentListProvider';
import SoundfontProvider from '../SoundfontProvider';
import PianoConfig from '../PianoConfig';
import swal from 'sweetalert';

import { 
  addRecordedNotes, 
  clearLoadedSongs, 
  clearRecordedNotes, 
  startPlaying, 
  startRecording, 
  stopPlaying, 
  stopRecording,
  toggleIsLoading,
  updateConfig 
} from '../../store/songReducer'


const Instrument = (props) => {
  const { song, user: { currentUser, url }} = useSelector(state => state)
  const dispatch = useDispatch()
  
  // initially stores recorded notes that will get sent to store when completed
  const [ songNotes, setSongNotes ] = useState([])

  // to do: export to ENV variables file
  // magentaCheckpoint is the api checkpoint maiestro connects to
  const magentaCheckpoint = "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn"
  // melodyRNN will handle interactions with the neural network
  const melodyRNN = new mm.MusicRNN(magentaCheckpoint) 
  // rnnPlayer will play the sequence maiestro gets back from melodyRNN
  const rnnPlayer = new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus')

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

  const handlePlay = () => {
    if (!song.recordedNotes.totalTime){
      return swal("There's nothing to play yet. Try recording something first.")
    }
    if (!song.playing){
      dispatch({ type: startPlaying.type })
    } else if (song.playing) {
      dispatch({ type: stopPlaying.type })
    } 
  } 

  const handleRecording = () => {
    if (!song.recording) dispatch({ type: startRecording.type });
    else {
      let last = songNotes.length - 1
      let totalTime = songNotes[last].endTime
      dispatch({ type: stopRecording.type })    
      dispatch({ 
        type: addRecordedNotes.type, 
        payload: {
          notes: songNotes,
          totalTime: totalTime
        }
      })
    }
  }

  const handleRecordNoteStart = (note) => {
    // adds new note with start time
    setSongNotes([ ...songNotes, note])
  }

  const handleRecordNoteEnd = (noteObj) => {
    // adds endTime and duration to recorded notes
    const newNotes = songNotes.map(note => {
      if (note.pitch === noteObj.pitch && !note.endTime){
        note.endTime = noteObj.endTime
        note.duration = note.endTime - note.start;
        return note
      } else {
        return note
      }
    })
    // save the updated notes array into state
    setSongNotes(newNotes)
  }

  const pausePlaying = () => {
    dispatch({ type: stopPlaying.type })
  }

  const handleClear = () => {
    // clear recorded notes in both state and store
    dispatch({ type: clearRecordedNotes.type })
    setSongNotes([])
  }

  const handleDuet = () => {
    if (songNotes.length){
      // begin configuration for magenta from recorded notes in state
      const notesToSequence = songNotes.map(note => {
        let newNote = {pitch: note.pitch}
        // converts note start time to 'steps' which are what magenta expects
        let newTime = Math.round((note.time * 4) / 4).toFixed(2)
        newNote.time = Math.round((newTime / 1000) * 4)
        
        // same as above, but for note end times
        let newEndTime = Math.round((note.endTime * 4) / 4).toFixed(2)
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

  const clearLoaded = () => {
    dispatch({ type: clearLoadedSongs.type })
  }

  const keyboardShortcuts = KeyboardShortcuts.create({
    firstNote: song.config.noteRange.first + song.config.keyboardShortcutOffset,
    lastNote: song.config.noteRange.last + song.config.keyboardShortcutOffset,
    keyboardConfig: KeyboardShortcuts.HOME_ROW,
  });

  const loaded = song.loadedSongs.length 

  return (
    <SoundfontProvider
      pausePlaying={pausePlaying}
      handleRecordNoteStart={handleRecordNoteStart}
      handleRecordNoteEnd={handleRecordNoteEnd}
      render={({ isLoading, playNote, stopNote, stopAllNotes }) => (
        <div>
            <div className="text-center">
            <div style={{ color: '#777' }}>
            </div>
          </div>
          <div className="btn-container">
            <button className="instrument-btn" onClick={handlePlay}>{song.playing ? "Stop" : "Play" }</button>
            <button className="instrument-btn" onClick={handleRecording}>{song.recording ? "Stop" : "Record" }</button>
            <button className="instrument-btn" onClick={handleClear}>Clear</button>
            <button className="instrument-btn" onClick={handleDuet}>Duet</button>
            <button className="instrument-btn" onClick={handleSave}>Save</button>
            <button className="instrument-btn" onClick={loaded ? clearLoaded : props.handleLoading}>{loaded ? "Clear Loaded" : "Load"}</button>
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
