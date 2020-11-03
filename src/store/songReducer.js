import { MidiNumbers } from 'react-piano';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    recordedNotes: {
      notes: [],
      totalTime: null
    },
    config: {
      instrumentName: 'acoustic_grand_piano',
      noteRange: {
        first: MidiNumbers.fromNote('c3'),
        last: MidiNumbers.fromNote('c5'),
      },
      keyboardShortcutOffset: 0,
    },
    playing: false,
    time: 0,
    recording: false,
    loadedSongs: [],
    title: "",
    isLoading: false,
    loadedIndex: 0,
}

const song = createSlice({
  name: "song",
  initialState,
  reducers: {
    addRecordedNotes: (state, action) => {
      state.recordedNotes.notes = action.payload.notes
      state.recordedNotes.totalTime = action.payload.totalTime
    },
    
    addNoteStart: (state, action) => {
      state.recordedNotes.notes.push(action.payload)
    },

    changeInstrument: (state, action) => {
      state.config.instrumentName = action.payload
    },

    changeTitle: (state, action) => { 
      state.title = action.payload 
    },

    clearLoadedSongs: (state, action) => { 
      state.loadedSongs = [] 
    },

    clearRecordedNotes: (state, action) => {
      state.recordedNotes.notes = []
      state.recordedNotes.totalTime = null
    },

    loadAllSongs: (state, action) => { 
      state.loadedSongs = action.payload 
    }, 

    loadSong: (state, action) => {
      state.recordedNotes = { notes: action.payload.notes, totalTime: action.payload.totalTime }
      state.config.instrumentName = action.payload.instrument
      state.title = action.payload.title
    },

    startRecording: (state, action) => {
      state.time = Date.now();
      state.recording = true;
    },

    stopRecording: (state, action) => { 
      state.recording = false 
    },

    startPlaying: (state, action) => {
      state.playing = true;
      state.time = Date.now();
    },

    stopPlaying: (state, action) => { state.playing = false },

    toggleIsLoading: (state, action) => { state.isLoading = action.payload },

    updateConfig: (state, action) => { state.config = action.payload },

    updateLoadedIndex: (state, action) => {state.loadedIndex = action.payload},

    updateRecordedNotes: (state, action) => {
      const { pitch, endTime } = action.payload

      state.recordedNotes.notes = state.recordedNotes.notes.map(note => {
        if (note.pitch === pitch && !note.endTime){
          note.endTime = endTime
          note.duration = note.endTime - note.start;
          return note
        } else {
          return note
        }
      });

      const last = state.recordedNotes.notes.length - 1
      state.recordedNotes.totalTime = state.recordedNotes.notes[last].endTime
    },
  }
});

export const {
  addRecordedNotes,
  addNoteStart,
  changeInstrument,
  changeTitle,
  clearLoadedSongs,
  clearRecordedNotes,
  loadAllSongs,
  loadSong,
  startRecording,
  startPlaying,
  stopRecording,
  stopPlaying,
  toggleIsLoading,
  updateConfig,
  updateLoadedIndex,
  updateRecordedNotes
} = song.actions
export default song.reducer;