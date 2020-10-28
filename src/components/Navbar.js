import React from 'react'
import { Link } from 'react-router-dom'

const NavBar = ({ url, currentUser, updateCurrentUser }) => {

  const handleLogout = () => {
    fetch(url + "/logout", {
      method: "POST",
      credentials: "include"
    })
      .then(r => r.json())
      .then(() => {
        updateCurrentUser(null)
      })
  }

    return (
      <header className="navbar">
        <Link className="link" to="/">
          <div className="logo">maiestro</div>
        </Link>
        <div className="actions">
          {currentUser ? (
            <button className="btn" 
              onClick={handleLogout}>Logout {currentUser.username}</button>
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