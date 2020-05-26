import React from 'react'
import { Link } from 'react-router-dom'

class LoginForm extends React.Component {
  state = {
    username: "",
    password: ""
  }

  handleInputChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  handleSubmit = event => {
    event.preventDefault()
    // TODO: when we get to auth, make this work
    fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(this.state)
      })
      .then(r => {
        if (r.ok){
          return r.json()
        } else {
          throw r
        }
      })
      .then(user => {
        this.props.updateCurrentUser(user)
        this.props.history.push("/home")
      })
      .catch(err => {
        alert("Something went wrong. Please try again.")
      })
    // this is our redirect
  }

  render() {
    const { username, password } = this.state
    return (
      <div className="form-container">
        <h3>Sign in to your account</h3>
        <form onSubmit={this.handleSubmit}>
          <label>Username:</label>
          <input type="text" name="username" onChange={this.handleInputChange} value={username} />
          <label>Password:</label>
          <input type="password" name="password" onChange={this.handleInputChange} value={password} />
          <input type="submit" value="Login" />
        </form>
      </div>
    )
  }
}

export default LoginForm