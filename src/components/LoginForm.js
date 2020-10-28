import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import swal from 'sweetalert';

import { login } from '../store/userReducer'


const LoginForm = (props) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const dispatch = useDispatch()

  const handleSubmit = event => {
    event.preventDefault()
    fetch(props.url + "/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          username,
          password
        })
      })
      .then(r => {
        if (r.ok){
          return r.json()
        } else {
          throw r
        }
      })
      .then(user => {
        dispatch({type: login, payload: user})
        props.history.push("/")
      })
      .catch(err => {
        swal("Invalid username or password. Please try again.")
      })
  }


  return (
    <div className="form-container">
      <h3>Sign in to your account</h3>
      <form onSubmit={handleSubmit}>
        <label>Username:</label>
        <input 
          className="form" 
          type="text" 
          name="username" 
          onChange={(e) => setUsername(e.target.value)} 
          value={username} 
        />
        <label>Password:</label>
        <input 
          className="form" 
          type="password" 
          name="password" 
          onChange={(e) => setPassword(e.target.value)} 
          value={password} 
        />
        <input className="btn" type="submit" value="Login" />
      </form>
    </div>
  )
}

export default LoginForm