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
  addNoteEnd, 
  addNoteStart, 
  changeInstrument, 
  changeTitle, 
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
        notes: song.recordedNotes
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
    if (!song.playing && song.recordedNotes.length > 1){
      dispatch({ type: startPlaying.type })
    } else if (song.playing) {
      dispatch({ type: stopPlaying.type })
    } else if (song.recordedNotes.length < 1){
      swal("There's nothing to play yet. Try recording something first.")
    }
  } 

  const handleRecording = () => {
    if (!song.recording) dispatch({ type: startRecording.type });
    else {
      dispatch({ type: stopRecording.type })    
      dispatch({ type: addNoteEnd.type, payload: songNotes })
    }
  }

  const handleRecordNoteStart = (note) => {
    setSongNotes([ ...songNotes, note])
  }

  const handleRecordNoteEnd = (noteObj) => {
    const newNotes = songNotes.map(note => {
      if (note.pitch === noteObj.pitch && !note.endTime){
        note.endTime = noteObj.endTime
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
  }

  const handleDuet = () => {
    if (song.recordedNotes.length > 0){
      let copy = [...songNotes ]
      const notesToSequence = []
      copy.map(note => {
        let newNote = {pitch: note.pitch}
        let newTime = Math.round((note.time * 4) / 4).toFixed(2) 
        newNote.time = Math.round((newTime / 1000) * 4)
        let newEndTime = Math.round((note.endTime * 4) / 4).toFixed(2)
        newNote.endTime = Math.round((newEndTime / 1000) * 4)
        notesToSequence.push(newNote)
        // return notesToSequence
      })
      let last = notesToSequence.length - 1
      const quantizeRecording = mm.sequences.quantizeNoteSequence(notesToSequence, 4)
      quantizeRecording.notes = notesToSequence
      quantizeRecording.totalQuantizedSteps = notesToSequence[last].endTime
      playDuet(quantizeRecording)
    } else {
      swal("You have to record a melody before activating duet mode")
    }
  }

  const playDuet = (sequence) => {
    if (this.rnnPlayer.isPlaying()) {
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

  const handlePlayingRecordedNotes = () => {
    if (!song.playing) return
    else {
      let sequence = { notes: [], totalTime: null }
      songNotes.map(note => {
        const duration = note.endTime - note.time;
        let noteCopy = {
          pitch: note.pitch,
          start: note.time,
          duration: duration
        }
        sequence.notes.push(noteCopy)
      })

      const lastNote = sequence.notes.length - 1
      sequence.totalTime = sequence.notes[lastNote].start + sequence.notes[lastNote].duration
      return sequence
    }
  }

  // useEffect(() => {
    
  // })

  // const componentDidUpdate = (prevProps) => {
  //   if (prevProps.song !== this.props.song){
  //     let updatedConfig = {...this.state.config}
  //     updatedConfig.instrumentName = this.props.song.tracks[0].instrument 
  //     this.setState({
  //       recordedNotes: this.props.song.notes,
  //       config: updatedConfig
  //     })
  //   }
  // }

  const keyboardShortcuts = KeyboardShortcuts.create({
    firstNote: song.config.noteRange.first + song.config.keyboardShortcutOffset,
    lastNote: song.config.noteRange.last + song.config.keyboardShortcutOffset,
    keyboardConfig: KeyboardShortcuts.HOME_ROW,
  });
  const loaded = props.loadedSongs.length > 0 

  return (
    <SoundfontProvider
      time={song.time}
      stopPlaying={stopPlaying}
      recording={song.recording}
      recordedNotes={song.recordedNotes}
      handleInstrumentChange={props.handleInstrumentChange}
      handleRecordNoteStart={handleRecordNoteStart}
      handleRecordNoteEnd={handleRecordNoteEnd}
      handlePlayingRecordedNotes={handlePlayingRecordedNotes}
      audioContext={props.audioContext}
      instrumentName={song.config.instrumentName}
      hostname={props.soundfontHostname}
      playing={song.playing}
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
                      dispatch({type: updateConfig, payload: Object.assign({}, song.config, config),
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
