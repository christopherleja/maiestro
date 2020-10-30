import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import * as mm from '@magenta/music'
import DimensionsProvider from './DimensionsProvider';
import InstrumentListProvider from './InstrumentListProvider';
import SoundfontProvider from './SoundfontProvider';
import PianoConfig from './PianoConfig';
import swal from 'sweetalert';

import { 
  addRecordedNotes, 
  clearRecordedNotes, 
  startPlaying, 
  startRecording, 
  stopPlaying, 
  stopRecording,
  updateConfig, 
} from '../store/songReducer'
// import { note } from '@tonaljs/tonal';


const Instrument = (props) => {
  const song = useSelector(state => state.song)
  const { currentUser, url } = useSelector(state => state.user)
  const dispatch = useDispatch()
  
  const [ songNotes, setSongNotes ] = useState([])

  
  const magentaCheckpoint = "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn"
  const melodyRNN = new mm.MusicRNN(magentaCheckpoint) 
  const rnnPlayer = new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus')
  
  useEffect(() => {
    melodyRNN.initialize()
  }, [])

  const handleSave = () => {
    if (currentUser && song.title !== ""){
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
        .then(melody => {
          console.log(melody);
        })
        .catch((error) => {
          console.error('Error:', error);
        });

      } else if (currentUser && song.title === "") {
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
      dispatch({ type: addRecordedNotes.type, 
        payload: {
          notes: songNotes,
          totalTime: totalTime
        }
      })
    }
  }

  const handleRecordNoteStart = (note) => {
    setSongNotes([ ...songNotes, note])
  }

  const handleRecordNoteEnd = (noteObj) => {
    const newNotes = songNotes.map(note => {
      if (note.pitch === noteObj.pitch && !note.endTime){
        note.endTime = noteObj.endTime
        note.duration = note.endTime - note.start;
        return note
      } else {
        return note
      }
    })
    setSongNotes(newNotes)
  }

  const pausePlaying = () => {
    dispatch({ type: stopPlaying.type })
  }

  const handleClear = () => {
    dispatch({ type: clearRecordedNotes.type })
    setSongNotes([])
  }

  const handleDuet = () => {
    if (songNotes.length){
      let copy = [...songNotes ]
      const notesToSequence = []
      copy.map(note => {
        let newNote = {pitch: note.pitch}
        let newTime = Math.round((note.time * 4) / 4).toFixed(2) 
        newNote.time = Math.round((newTime / 1000) * 4)
        let newEndTime = Math.round((note.endTime * 4) / 4).toFixed(2)
        newNote.endTime = Math.round((newEndTime / 1000) * 4)
        notesToSequence.push(newNote)
        return notesToSequence
      })

      let last = notesToSequence.length - 1
      const quantizeRecording = mm.sequences.quantizeNoteSequence(notesToSequence, 4)
      quantizeRecording.notes = notesToSequence
      quantizeRecording.totalQuantizedSteps = notesToSequence[last].endTime
      console.log(quantizeRecording)
      playDuet(quantizeRecording)
    } else {
      swal("You have to record a melody before activating duet mode")
    }
  }

  const playDuet = (sequence) => {
    if (rnnPlayer.isPlaying()) {
      return rnnPlayer.stop()
    } else {
      let rnnSteps = 128;
      let rnnTemp = 1;

      melodyRNN
      .continueSequence(sequence, rnnSteps, rnnTemp)
      .then((sample => {
        rnnPlayer.start(sample)
      }))
    }
  }

  const keyboardShortcuts = KeyboardShortcuts.create({
    firstNote: song.config.noteRange.first + song.config.keyboardShortcutOffset,
    lastNote: song.config.noteRange.last + song.config.keyboardShortcutOffset,
    keyboardConfig: KeyboardShortcuts.HOME_ROW,
  });
  const loaded = props.loadedSongs.length 

  return (
    <SoundfontProvider
      pausePlaying={pausePlaying}
      handleInstrumentChange={props.handleInstrumentChange}
      handleRecordNoteStart={handleRecordNoteStart}
      handleRecordNoteEnd={handleRecordNoteEnd}
      audioContext={props.audioContext}
      hostname={props.soundfontHostname}
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
            <button className="instrument-btn" onClick={loaded ? props.handleClearLoadedSongs : props.handleLoading}>{loaded ? "Clear Loaded" : "Load"}</button>
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
