import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { logout } from '../../store/userReducer'
import { clearLoadedSongs, clearRecordedNotes } from '../../store/songReducer'

const NavBar = () => {

  const {currentUser, url} = useSelector(state => state.user);
  const dispatch = useDispatch();

  const handleLogout = () => {
    fetch(url + "/logout", {
      method: "POST",
      credentials: "include"
    })
      .then(r => r.json())
      .then(() => {
        dispatch({ type: logout.type })
        dispatch({ type: clearRecordedNotes.type })
        dispatch({ type: clearLoadedSongs.type })
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