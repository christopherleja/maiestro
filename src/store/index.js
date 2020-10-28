import { configureStore } from '@reduxjs/toolkit'
import musicReducer from './musicReducer'
import userReducer from './userReducer'

const reducer = {
  music: musicReducer, 
  user: userReducer
}

const store = configureStore({reducer})

export default store