import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { AuthState } from './auth.reducer';

export const selectAuth = (state: AppState) => state.auth;

export const loginStatus = createSelector(
  selectAuth,
  (state: AuthState) => state.loginStatus
);

export const provider = createSelector(
  selectAuth,
  (state: AuthState) => state.provider
);

export const error = createSelector(
  selectAuth,
  (state: AuthState) => state.error
);

export const user = createSelector(
  selectAuth,
  (state: AuthState) => state.user
);

export const isAuthenticated = createSelector(
  selectAuth,
  (state: AuthState) => !!state.user
);

export const token = createSelector(selectAuth, (state: AuthState) => {
  return state.user?.accessToken ?? null;
});
