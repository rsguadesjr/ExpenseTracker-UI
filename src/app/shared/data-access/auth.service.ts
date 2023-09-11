import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { JwtHelperService } from '@auth0/angular-jwt';
import {
  BehaviorSubject,
  Observable,
  catchError,
  from,
  map,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthRequestResult } from '../model/auth-request-result';
import { EmailPasswordRegistration } from '../model/email-password-registration';
import { AuthData } from 'src/app/core/models/auth-data';
import firebase from 'firebase/compat/app';

// TODO: actual token will have to come from the API,
// after google authentication, the token will be used to login to API and the API will then send the actual token
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  authUrl: string;

  // firebaseToken$ = new BehaviorSubject<any>(null);
  firebaseUser$ = this.afAuth.authState;
  fireAuthUser: firebase.User | null = null;
  // isAuthenticated$ = new BehaviorSubject<boolean>(false);

  googleLoginInProgress$ = new BehaviorSubject<boolean>(false);

  constructor(
    public jwtHelper: JwtHelperService,
    public afAuth: AngularFireAuth,
    private router: Router,
    private http: HttpClient
  ) {
    this.authUrl = environment.API_BASE_URL + 'api/Auth';
    // this.isAuthenticated$.next(this.isAuthenticated());
    this.afAuth.user.subscribe((user) => {
      this.fireAuthUser = user;
    });
  }

  public signInWithEmailAndPassword(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  /**
   * Signout
   * Removes the accessToken item in localStorage
   * signout from firebase
   * will trigger the authentication to be false
   * navigates back to login page
   */
  public signOut() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.afAuth.signOut();
    // this.isAuthenticated$.next(false);
    // const state = this.router.routerState.snapshot;
    // this.router.navigate(['login'], { queryParams: { returnUrl: state?.url } });
  }

  /**
   *
   * @param data username and password object to be sent to api to create the account
   * @returns
   */
  public signUp(data: EmailPasswordRegistration) {
    return this.http.post(`${this.authUrl}/RegisterWithEmailAndPassword`, data);
  }

  /**
   *
   * @param email will send an email containing reset password link to the provided email
   * @returns
   */
  public resetPassword(email: string) {
    return this.afAuth.sendPasswordResetEmail(email, {
      url: `${location.origin}/login`,
    });
  }

  /**
   *
   * @param token the token from firebase authentication, will be used to authenticate to the api
   * @param provider right now not needed, not sure if additional auth providers will be added
   * @returns a jwt token generated from the api
   */
  public login(token: string) {
    return this.http.post<AuthRequestResult>(`${this.authUrl}/login`, {
      token,
    });
  }

  /**
   * will set the accessToken to the localStorage
   * and triggers the isAuthenticated$
   */
  public setAuthData(token: string) {
    localStorage.setItem('accessToken', token);

    if (token) {
      const decoded = this.jwtHelper.decodeToken(token);
      const user = {} as any;
      Object.keys(decoded).forEach((key) => {
        let newKey = key;
        if (['Email', 'Name', 'PhotoUrl', 'Role', 'UserId'].includes(key)) {
          newKey = key.charAt(0).toLowerCase() + key.slice(1);
        }
        user[newKey] = decoded[key];
      });

      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  public getAuthData(): AuthData | null {
    const accessToken = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return { ...userData, accessToken };
    }

    return null;
  }

  /**
   * helper method to return if accessToken is present and not yet expired
   * @returns validity of token
   */
  public isAuthenticated() {
    const token = localStorage.getItem('accessToken');
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  /**
   * helper method to get current access token
   * @returns token value
   */
  public getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  public refreshToken(): Observable<string> {
    return this.afAuth.user.pipe(
      switchMap((user) => {
        if (user) {
          return from(user.getIdTokenResult()).pipe(
            switchMap((idTokenResult) => this.login(idTokenResult.token)),
            map((authData) => authData.token)
          );
        }
        return throwError(() => '');
      })
    );
  }
}
