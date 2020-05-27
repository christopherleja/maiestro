import React from 'react'

class SignUpForm extends React.Component {
  state = {
    username: "",
    password: "",
    password_confirmation: ""
  }

  handleInputChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  handleSubmit = event => {
    event.preventDefault()
    if (this.state.password === this.state.password_confirmation && this.state.password.length >= 6){
      fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
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
        alert("Looks like that username is already taken. Please try another")
      })
    } else if (this.state.password === this.state.password_confirmation && this.state.password.length < 6) {
      alert("Password must be at least 6 characters")
    } else {
      alert("Passwords don't match")
    } 
  }

  render() {
    const { username, password, password_confirmation } = this.state
    return (
      <div className="form-container">
        <h3>Sign up for an account</h3>
        <form onSubmit={this.handleSubmit}>
          <label>Username:</label>
          <input className="form" type="text" name="username" onChange={this.handleInputChange} value={username} />
          <label>Password:</label>
          <input className="form" type="password" name="password" onChange={this.handleInputChange} value={password} />
          <label>Confirm Password:</label>
          <input className="form" type="password" name="password_confirmation" onChange={this.handleInputChange} value={password_confirmation} />
          <input className="btn" type="submit" value="Sign Up" />
        </form>
      </div>
    )
  }
}

export default SignUpForm