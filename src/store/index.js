import { configureStore } from '@reduxjs/toolkit'
import songReducer from './songReducer'
import userReducer from './userReducer'

const reducer = {
  song: songReducer, 
  user: userReducer
}

const store = configureStore({reducer})

export default store