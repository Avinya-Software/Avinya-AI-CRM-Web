// src/store/authSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  advisorId: string | null;
  fullName: string | null;
  email: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  advisorId: null,
  fullName: null,
  email: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<any>) => {
      state.advisorId = action.payload.advisorId;
      state.fullName = action.payload.fullName;
      state.email = action.payload.email;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.advisorId = null;
      state.fullName = null;
      state.email = null;
      state.isAuthenticated = false;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
