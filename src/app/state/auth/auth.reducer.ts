import { createReducer, on } from '@ngrx/store';
import {
  login,
  loginError,
  loginSuccess,
  loginWithEmailAndPassword,
  logout,
} from './auth.action';
import { AuthData } from 'src/app/core/models/auth-data';

export interface AuthState {
  user: AuthData | null;
  error: string | null;
  loginStatus: 'pending' | 'loading' | 'error' | 'success';
  provider: 'Email' | 'Google' | null;
}

export const initialState: AuthState = {
  user: null,
  error: null,
  loginStatus: 'pending',
  provider: null,
};

export const authReducer = createReducer(
  initialState,

  on(login, (state, { provider }) => ({
    ...state,
    error: null,
    loginStatus: 'loading' as const,
    provider: provider,
  })),

  on(loginSuccess, (state, { user }) => {
    return { ...state, error: null, loginStatus: 'success' as const, user };
  }),

  on(loginError, (state, { error }) => ({
    ...state,
    error,
    loginStatus: 'error' as const,
  })),

  on(logout, (state) => ({
    ...state,
    user: null,
  })),

  on(loginWithEmailAndPassword, (state) => ({
    ...state,
    loginStatus: 'loading' as const,
  }))
);
