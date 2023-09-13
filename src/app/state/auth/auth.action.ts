import { createAction, props } from '@ngrx/store';
import { AuthData } from 'src/app/core/models/auth-data';

export const login = createAction(
  '[Auth Page] Login',
  props<{ idToken: string }>()
);

export const loginWithEmailAndPassword = createAction(
  '[Auth Page] Login with Email and Password',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth API] Login Success',
  props<{ user: AuthData | null }>()
);

export const loginError = createAction(
  '[Auth API] Login Error',
  props<{ error: string }>()
);

export const autoLogin = createAction('[AUTH PAGE] Auto Login');
export const logout = createAction('[AUTH PAGE] Logout');
export const refreshAuth = createAction('[AUTH PAGE] Refresh Auth');
