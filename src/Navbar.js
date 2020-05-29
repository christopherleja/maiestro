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
      <header className="navbar">
        <Link className="link" to="/home">
          <div className="logo">maiestro</div>
        </Link>
        <div className="actions">
          {props.currentUser ? (
            <button className="btn" onClick={handleLogout}>Logout {props.currentUser.username}</button>
          ) : (
              <>
                <Link className="link" to="/login">
                  <button className="btn">Login</button>
                </Link>
                <Link className="link" to="/signup">
                  <button className="btn">Sign Up</button>
                </Link>
              </>
            )}
        </div>
      </header>
    )
  }

export default NavBar