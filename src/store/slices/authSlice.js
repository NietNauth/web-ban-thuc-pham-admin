import { createSlice } from '@reduxjs/toolkit';

// Khôi phục user từ localStorage khi app khởi động
const storedUser = (() => {
  try {
    const raw = localStorage.getItem('admin_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

const initialState = {
  user: storedUser, // Employee info (bao gồm role)
  isAuthenticated: !!localStorage.getItem('admin_token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.isAuthenticated = true;
      localStorage.setItem('admin_token', token);
      // Persist user info (gồm role) để kiểm tra phân quyền sau reload
      localStorage.setItem('admin_user', JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      // Cập nhật user trong localStorage
      localStorage.setItem('admin_user', JSON.stringify(state.user));
    }
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;

export default authSlice.reducer;
