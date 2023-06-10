import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { JwtHelperService } from '@auth0/angular-jwt';
import { GoogleAuthProvider, User, getIdTokenResult } from 'firebase/auth';
import {
  BehaviorSubject,
  Observable,
  Subject,
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

  initialize$ = new Subject<boolean>();

  googleLoginInProgress$ = new BehaviorSubject<boolean>(false);

  constructor(
    public jwtHelper: JwtHelperService,
    public afAuth: AngularFireAuth,
    private router: Router,
    private http: HttpClient
  ) {
    this.authUrl = environment.API_BASE_URL + 'api/Auth';
    // afAuth.authState.subscribe((user) => {
    //   this.firebaseUser$.next(user);
    // });

    // // const googleLoginStatus = sessionStorage.getItem('googleLoginStatus');
    // // this.googleLoginStatus(googleLoginStatus?.toLowerCase() === 'true');
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

  // public signInWithEmailAndPassword(email: string, password: string) {
  //   return this.afAuth.signInWithEmailAndPassword(email, password)
  // }

  /**
   * Signout
   */
  public signOut() {
    localStorage.removeItem('accessToken');
    this.afAuth.signOut();
    this.initialize$.next(false);
    const state = this.router.routerState.snapshot;
    this.router.navigate(['login'], { queryParams: { returnUrl: state?.url }});
  }

  public signUp(data: EmailPasswordRegistration) {
    return this.http.post(`${this.authUrl}/RegisterWithEmailAndPassword`, data);
  }

  public resetPassword(email: string) {
    return this.afAuth.sendPasswordResetEmail(email, {
      url: `${location.origin}/login`,
    });
  }

  // public login(token: string) {
  //   return this.http.post<AuthRequestResult>(`${this.authUrl}/login`, { token });
  // }

  public login(token: string, provider: string = '') {
    return this.http.post<AuthRequestResult>(`${this.authUrl}/login`, {
      token,
      provider,
    })
    .pipe(
      tap(() => {
        this.initialize$.next(true);
      })
    );
  }

  public setAuthData(authData: any) {
    localStorage.setItem('accessToken', authData.token);
  }

  public isAuthenticated() {
    const token = localStorage.getItem('accessToken');
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  public getAccessToken() {
    return localStorage.getItem('accessToken');
  }

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
