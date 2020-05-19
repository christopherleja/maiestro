import * as Magenta from '@magenta/music'
import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux'
import 'react-piano/dist/styles.css';
import './App.css';
import InstrumentContainer from './InstrumentContainer'


function App() {
  const magentaCheckpoint = 'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv'
  const improvRNN = new Magenta.MusicRNN(magentaCheckpoint) 

  return (
    <>
    <InstrumentContainer magentaCheckpoint={magentaCheckpoint} improvRNN={improvRNN}/>
    {/* <CustomPiano soundfontHostname={soundfontHostname} audioContext={audioContext}/> */}
    </>
  );
    
}

export default App
