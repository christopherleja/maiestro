import React, { useEffect} from 'react';
import ReactDOM from 'react-dom';
import { Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'
import Particles from 'react-particles-js'
import 'react-piano/dist/styles.css';
import './css/App.css';
import InstrumentContainer from './components/InstrumentContainer'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'
import Navbar from './components/Navbar'
import { login } from './store/userReducer';


function App() {
  const URL = useSelector(state => state.user.url)
  const currentUser = useSelector(state => state.user.currentUser)

  const dispatch = useDispatch()

  useEffect(() => {
    fetch(URL + '/autologin', {
      credentials: 'include'
    })
    .then(r => r.json())
    .then(user => {
      if (user.username){
        dispatch({ type: login, payload: user })
      } else {
        return
      }
    })
  }, [])

  return (
    <>
    <Navbar />
    <Route path='/' exact render={() => <InstrumentContainer />} />
    <Route path="/login" render= {routeProps => <LoginForm {...routeProps} />} />
    <Route path="/signup" render= {routeProps => <SignupForm {...routeProps} />} />
    <Particles />
    </>
  );
    
}

export default App
