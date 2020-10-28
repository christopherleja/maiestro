import { configureStore } from '@reduxjs/toolkit'
import musicReducer from './musicReducer'

const store = configureStore({reducer: musicReducer})

export default store