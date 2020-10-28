import { MidiNumbers } from 'react-piano';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    recordedNotes: [],
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
}


const song = createSlice({
  name: "song",
  initialState,
  reducers: {
    addNoteEnd: (state, action) => {
      state.recordedNotes = action.payload
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
    clearRecordedNotes: (state, action) => {
      state.recordedNotes = []
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
    updateConfig: (state, action) => {
      state.config = action.payload
    }
  },
})

export const {
  addNoteEnd,
  addNoteStart,
  changeInstrument,
  changeTitle,
  clearRecordedNotes,
  startRecording,
  stopRecording,
  startPlaying,
  stopPlaying,
  updateConfig
} = song.actions
export default song.reducer;