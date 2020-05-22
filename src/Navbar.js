import React from 'react'
import { Link } from 'react-router-dom'


const NavBar = (props) => {

  const handleLogout = () => {
    fetch(props.url + "/logout", {
      method: "POST",
      credentials: "include"
    })
      .then(r => r.json())
      .then(() => {
        props.updateCurrentUser(null)
      })
  }

    return (
      <header>
        <Link to="/home">
          <div className="logo" />
        </Link>
        <div className="actions">
          {props.currentUser ? (
            <button onClick={handleLogout}>Logout {props.currentUser.username}</button>
          ) : (
              <>
                <Link to="/login">
                  <button>Login</button>
                </Link>
                <Link to="/signup">
                  <button>Sign Up</button>
                </Link>
              </>
            )}
        </div>
      </header>
    )
  }

export default NavBar