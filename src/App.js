import React, { useEffect} from 'react';
import { Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'
import Particles from 'react-particles-js'
import 'react-piano/dist/styles.css';
import './css/App.css';
import InstrumentContainer from './components/instrument/InstrumentContainer'
import LoginForm from './components/user/LoginForm'
import SignupForm from './components/user/SignupForm'
import Navbar from './components/user/Navbar'
import Spinner from 'react-spinkit';

import { login } from './store/userReducer';

function App() {
  const URL = useSelector(state => state.user.url)
  const isLoading = useSelector(state => state.song.isLoading )

  const dispatch = useDispatch()

  const autoLogin = () => {
    fetch(URL + '/autologin', {
      credentials: 'include'
    })
    .then(r => r.json())
    .then(res => {
      if (res){
        dispatch({ type: login.type, payload: res })
      } else {
        return null;
      }
    })
  }

  useEffect(() => {
    autoLogin()
  }, [])

  return (
    <>
    <Navbar />
    <Route path='/' exact render={() => <InstrumentContainer />} />
    <Route path="/login" render= {routeProps => <LoginForm {...routeProps} />} />
    <Route path="/signup" render= {routeProps => <SignupForm {...routeProps} />} />
    { isLoading && 
    <div className="loading-icon-container">
      <Spinner name="ball-spin-fade-loader" 
        className="loading-icon" color="purple"
        /> 
    </div>}
    <Particles />
    </>
  );
    
}

export default App
