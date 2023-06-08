import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { JwtHelperService } from '@auth0/angular-jwt';
import { GoogleAuthProvider, User, getIdTokenResult } from 'firebase/auth';
import { BehaviorSubject, Observable, catchError, from, map, of, switchMap, tap, throwError } from 'rxjs';
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
  user$ = new BehaviorSubject<any>(null);

  googleLoginInProgress$ = new BehaviorSubject<boolean>(false);

  constructor(
    public jwtHelper: JwtHelperService,
    public afAuth: AngularFireAuth,
    private router: Router,
    private http: HttpClient
  ) {
    this.authUrl = environment.API_BASE_URL + 'api/Auth';
    this.afAuth.authState;
    // afAuth.authState.subscribe((user) => {
    //   this.firebaseUser$.next(user);
    // });

    // // const googleLoginStatus = sessionStorage.getItem('googleLoginStatus');
    // // this.googleLoginStatus(googleLoginStatus?.toLowerCase() === 'true');

    const user = JSON.parse((localStorage.getItem('user') || null ) as any);
    this.user$.next(user);
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
    // this.afAuth.signOut().then(() => {
    //   this.googleLoginStatus(false);
    //   localStorage.removeItem('accessToken');
    //   localStorage.removeItem('user');
    //   this.firebaseToken$.next(null);
    //   this.user$.next(null);
    //   this.router.navigate(['login']);
    // });
  }

  public signUp(data: EmailPasswordRegistration) {
    return this.http.post(`${this.authUrl}/RegisterWithEmailAndPassword`, data);
  }

  public resetPassword(email: string) {
    return this.afAuth.sendPasswordResetEmail(email, {
      url: `${location.origin}/login`
    });
  }

  // public login(token: string) {
  //   return this.http.post<AuthRequestResult>(`${this.authUrl}/login`, { token });
  // }

  public login(token: string, provider: string = '') {
    return this.http.post<AuthRequestResult>(`${this.authUrl}/login`, {
      token,
      provider
     });
  }

  public setAuthData(authData: any) {
    console.log('[DEBUG] setAuthData', authData)
    localStorage.setItem('accessToken', authData.token);
  }

  public isAuthenticated() {
    const token = localStorage.getItem('accessToken');
    return !!token && !this.jwtHelper.isTokenExpired(token);
    // return !!token;
  }

  public getAccessToken() {
    return localStorage.getItem('accessToken');
  }


  public async refreshToken() {
    const user = await this.afAuth.currentUser;
    console.log('[DEBUG] refreshToken 1', user)
    if (!user)
      return false;

    const idTokenResult = await user.getIdTokenResult(true);
    console.log('[DEBUG] refreshToken 2', idTokenResult)
    if (!idTokenResult)
      return false;

    const token = idTokenResult.token;
    let isRefreshSuccess: boolean = false;
    const result = await new Promise((resolve, reject) => {
      this.login(token)
        .subscribe({
          next: (authResult) => {
            isRefreshSuccess = true;
            this.setAuthData(authResult);
            resolve(authResult);
          },
          error: (_) => {
            isRefreshSuccess = false;
            this.signOut();
            reject;
          }
        })
    })


    console.log('[DEBUG] refreshToken 3', result);
    return isRefreshSuccess;

  }


  public refresh () {

    return this.firebaseUser$.pipe(
      switchMap(user => {
        console.log('[DEBUG] refresh 1', user);
        if (user) {
          return from(user.getIdTokenResult()).pipe(
            map(idTokenResult => idTokenResult?.token)
          )
        }
        return of('')
      }),
      switchMap(token => {
        console.log('[DEBUG] refresh 2', token);
        if (token) {
          return this.login(token)
            .pipe(
              tap(result => {
                console.log('[DEBUG] refresh 3 ', token);
                this.setAuthData(result);
              }),
              map(() => true),
              catchError((error) => {
                console.log('[DEBUG] refresh 4 error ', token);
                return throwError(() => error);
              })
            )
        }
        return of(false)
      })
    )
  }

  // public refreshToken() {
  //   return this.firebaseToken$.pipe(
  //     switchMap(token => {
  //       if (token) {
  //         return this.login(token, '')
  //       }
  //       return of();
  //     })
  //   )

  //   // const user = await this.afAuth.currentUser;
  //   // if (!user) return

  //   // const newToken = await user.
  // }


  // private get firebaseToken$() {
  //   return this.afAuth.authState.pipe(
  //     switchMap((user) => {
  //       if (user) {
  //         return from(user.getIdTokenResult(true)).pipe(
  //           map(idTokenResult => idTokenResult?.token)
  //         )
  //       }
  //       return of('')
  //     })
  //   )
  // }

  // public googleLoginStatus(status: boolean) {
  //   sessionStorage.setItem('googleLoginStatus', status?.toString());
  //   this.googleLoginInProgress$.next(status);
  // }
}
