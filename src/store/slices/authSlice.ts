import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  id: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: AuthUser | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  sessionToken: null,
  isAuthenticated: false,
  isGuest: false,
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser; sessionToken?: string | null }>
    ) => {
      state.user = action.payload.user;
      state.sessionToken = action.payload.sessionToken || null;
      state.isAuthenticated = true;
      state.isGuest = false;
      state.isLoading = false;
      state.error = null;
    },
    setGuestMode: (state) => {
      state.user = null;
      state.sessionToken = null;
      state.isAuthenticated = false;
      state.isGuest = true;
      state.isLoading = false;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.sessionToken = null;
      state.isAuthenticated = false;
      state.isGuest = false;
      state.isLoading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCredentials,
  setGuestMode,
  logout,
  setLoading,
  setError,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
