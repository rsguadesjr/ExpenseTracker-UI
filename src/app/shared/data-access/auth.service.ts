import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { JwtHelperService } from '@auth0/angular-jwt';
import {
  BehaviorSubject,
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

// TODO: actual token will have to come from the API,
// after google authentication, the token will be used to login to API and the API will then send the actual token
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  authUrl: string;

  // firebaseToken$ = new BehaviorSubject<any>(null);
  firebaseUser$ = this.afAuth.authState;
  isAuthenticated$ = new BehaviorSubject<boolean>(false);

  googleLoginInProgress$ = new BehaviorSubject<boolean>(false);

  constructor(
    public jwtHelper: JwtHelperService,
    public afAuth: AngularFireAuth,
    private router: Router,
    private http: HttpClient
  ) {
    this.authUrl = environment.API_BASE_URL + 'api/Auth';
    this.isAuthenticated$.next(this.isAuthenticated());
  }

  // /**
  //  * Sign in to using gmail.
  //  * After successful sign in, the token will be used to authenticate/login to ExpenseTracker API.
  //  * The ExpenseTracker API will provide a new token which will be the one to use for all the succeeding calls
  //  */
  // public signInViaGoogle() {
  //   this.googleLoginStatus(true);

  //   this.afAuth
  //     .signInWithRedirect(new GoogleAuthProvider())
  //     .then((result) => {
  //     })
  //     .catch((error) => {
  //     });
  // }

  public signInWithEmailAndPassword({ email, password } : { email: string, password: string }) {
    return this.afAuth.signInWithEmailAndPassword(email, password)
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
    this.afAuth.signOut();
    this.isAuthenticated$.next(false);
    const state = this.router.routerState.snapshot;
    this.router.navigate(['login'], { queryParams: { returnUrl: state?.url }});
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
  public login(token: string, provider: string = '') {
    return this.http.post<AuthRequestResult>(`${this.authUrl}/login`, {
      token,
      provider,
    });
  }

  /**
   * will set the accessToken to the localStorage
   * and triggers the isAuthenticated$
   */
  public setAuthData(authData: any) {
    localStorage.setItem('accessToken', authData.token);
    this.isAuthenticated$.next(this.isAuthenticated());
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


  /**
   *
   * @returns the user data from the decoded token
   */
  public getUserData() {
    if (this.isAuthenticated())
      return this.jwtHelper.decodeToken(this.getAccessToken()!);

    return null;
  }

  /**
   * If current token has expired, will have to refetch token from firebase
   * and revalidate the token to the api to get a new jwt token
   * @returns
   */
  public refreshToken() {
    return this.firebaseUser$.pipe(
      switchMap((user) => {
        if (user) {
          return from(user.getIdTokenResult()).pipe(
            map((idTokenResult) => idTokenResult?.token)
          );
        }
        return of('');
      }),
      switchMap((token) => {
        if (token) {
          return this.login(token).pipe(
            tap((result) => {
              this.setAuthData(result);
            }),
            map(() => true),
            catchError((error) => {
              this.signOut();
              return throwError(() => error);
            })
          );
        }
        return of(false);
      }),
      // if unable to fetch the new token
      // then logout
      catchError((error) => {
        this.signOut();
        return throwError(() => error);
      })
    );
  }

}
