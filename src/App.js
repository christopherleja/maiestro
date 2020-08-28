import * as mm from '@magenta/music'
import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import { Route } from 'react-router-dom';
import { connect } from 'react-redux'
import Particles from 'react-particles-js'
import 'react-piano/dist/styles.css';
import './css/App.css';
import InstrumentContainer from './components/InstrumentContainer'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'
import Navbar from './components/Navbar'


function App() {
  const URL = "http://localhost:3000"
  const magentaCheckpoint = "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn"
  const melodyRNN = new mm.MusicRNN(magentaCheckpoint) 
  melodyRNN.initialize()

  const rnnPlayer = new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus')

  const [currentUser, setCurrentUser] = useState(null)

  const updateCurrentUser = (user) => {
    setCurrentUser(user)
  }

  useEffect(() => {
    fetch(URL + '/autologin', {
      credentials: 'include'
    })
    .then(r => r.json())
    .then(user => {
      if (user.username){
        setCurrentUser(user)
      } else {
        return
      }
    })
  }, [])

  return (
    <>
    <Navbar url={URL} currentUser={currentUser} updateCurrentUser={updateCurrentUser}/>
    
    <Route path='/' exact render = {() => <InstrumentContainer melodyRNN={melodyRNN} rnnPlayer={rnnPlayer} currentUser={currentUser} url={URL}/>} />
    <Route path="/login" render= {routeProps => <LoginForm {...routeProps} updateCurrentUser={updateCurrentUser} url={URL}/>}/>
    <Route path="/signup" render= {routeProps => <SignupForm {...routeProps} updateCurrentUser={updateCurrentUser} url={URL}/>}/>
    <Particles />
    </>
  );
    
}

export default App
