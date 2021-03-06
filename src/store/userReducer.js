import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null,
};

const user = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {state.currentUser = action.payload},
    logout: (state, action) => {state.currentUser = null},
  }
})


export const { login, logout } = user.actions
export default user.reducer

