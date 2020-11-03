import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import swal from 'sweetalert';
import { login } from '../../store/userReducer'
import config from '../../constants'

const SignUpForm = props => {
  const [ username, setUsername ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ password_confirmation, setPassword_confirmation ] = useState('');
  
  const url = config.url
  const dispatch = useDispatch()
  
  const handleUsername = e => {
    setUsername(e.target.value)
  }

  const handlePassword = e => {
    setPassword(e.target.value)
  }
  
  const handlePassword_confirmation = e => {
    setPassword_confirmation(e.target.value)
  }

  const handleSubmit = event => {
    event.preventDefault()
    if (password === password_confirmation && password.length >= 6){
      const newUser = {
        username,
        password,
        password_confirmation
      }
      fetch(url + "/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newUser)
      })
      .then(r => {
        if (r.ok){
          return r.json()
        } else {
          throw r
        }
      })   
      .then(user => {
        dispatch({ type: login.type, payload: user })
        props.history.push("/")
      })
      .catch(err => {
        swal("Looks like that username is already taken. Please try another")
      })
    } else if (password === password_confirmation && password.length < 6) {
      swal("Password must be at least 6 characters")
    } else {
      swal("Passwords don't match")
    } 
  }

  return (
    <div className="form-container">
      <h3>Sign up for an account</h3>
      <form onSubmit={handleSubmit}>
        
        <label>Username:</label>
        <br />
        <input className="form" 
          type="text" 
          name="username" 
          onChange={handleUsername} 
        />
        
        <br />
        <label>Password:</label>
        <br />
        <input className="form" 
          type="password" 
          name="password" 
          onChange={handlePassword} 
        />

        <br/>
        <label>Confirm Password:</label>
        <br />
        <input className="form" 
          type="password" name="password_confirmation" 
          onChange={handlePassword_confirmation} 
        />

        <br />
        <input className="btn" type="submit" value="Sign Up" />
      </form>
    </div>
  )
}


export default SignUpForm