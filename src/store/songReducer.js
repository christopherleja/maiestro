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
    activeAudioNodes: {},
    playing: false,
    time: 0,
    recording: false,
    loadedSongs: [],
    title: "",
    isLoading: false,
    constants: {
      soundfontHostname: 'https://d1pzp51pvbm36p.cloudfront.net',
      format: 'mp3',
      soundfont: 'MusyngKite',
    }
}

export const audioContext = new (window.AudioContext || window.webkitAudioContext)()

const song = createSlice({
  name: "song",
  initialState,
  reducers: {
    addRecordedNotes: (state, action) => {
      state.recordedNotes.notes = action.payload.notes
      state.recordedNotes.totalTime = action.payload.totalTime
    },
    
    addNoteStart: (state, action) => {
      state.recordedNotes.push(action.payload)
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
      state.recording = false;
    },

    startPlaying: (state, action) => {
      state.playing = true;
      state.time = Date.now();
    },

    stopPlaying: (state, action) => {
      state.playing = false
    },

    toggleIsLoading: (state, action) => {
      state.isLoading = action.payload
    },

    updateConfig: (state, action) => {
      state.config = action.payload
    },
  },
})

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
  updateConfig
} = song.actions
export default song.reducer;