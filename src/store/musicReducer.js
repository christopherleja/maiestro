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


const musicReducer = createSlice({
  name: "music",
  initialState,
  reducers: {
    changeInstrument: (state, action) => {
      state.config.instrumentName = action.payload
    },
    changeTitle: (state, action) => state.title = action.payload,
    startRecording: (state, action) => {
      state.time = Date.now();
      state.recording = true;
      console.log(action);
    },
    stopRecording: (state, action) => {
      state.recording = false;
    }
  }
})

export default musicReducer;