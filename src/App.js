import * as mm from '@magenta/music'
import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux'
import 'react-piano/dist/styles.css';
import './App.css';
import InstrumentContainer from './InstrumentContainer'


function App() {
  const magentaCheckpoint = "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn"
  const improvRNN = new mm.MusicRNN(magentaCheckpoint) 
  improvRNN.initialize()

  const rnnPlayer = new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus')

  return (
    <>
    {console.log(improvRNN)}
    <InstrumentContainer improvRNN={improvRNN} rnnPlayer={rnnPlayer}/>
    {/* <CustomPiano soundfontHostname={soundfontHostname} audioContext={audioContext}/> */}
    </>
  );
    
}

export default App
