import * as mm from '@magenta/music'
import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux'
import Particles from 'react-particles-js'
import 'react-piano/dist/styles.css';
import './App.css';
import InstrumentContainer from './InstrumentContainer'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'
import Navbar from './Navbar'


function App() {
  const URL = "https://maiestro-backend.herokuapp.com/"
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
