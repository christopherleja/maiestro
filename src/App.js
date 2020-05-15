import * as Magenta from '@magenta/music'
import { Note } from "@tonaljs/tonal"
import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux'
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css';
import DimensionsProvider from './DimensionsProvider';
import SoundfontProvider from './SoundfontProvider';
import CustomPiano from './CustomPiano'
import './App.css';


function App() {
  const magentaCheckpoint = 'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv'
  const improvRNN = new Magenta.MusicRNN(magentaCheckpoint) 

// webkitAudioContext fallback needed to support Safari
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const soundfontHostname = 'https://d1pzp51pvbm36p.cloudfront.net';

  return (
    <CustomPiano soundfontHostname={soundfontHostname} audioContext={audioContext}/>
  );
    
}

export default App
