import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { JwtHelperService } from '@auth0/angular-jwt';
import { GoogleAuthProvider, User } from 'firebase/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthRequestResult } from '../model/auth-request-result';

// TODO: actual token will have to come from the API,
// after google authentication, the token will be used to login to API and the API will then send the actual token
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  authUrl: string;

  firebaseToken$ = new BehaviorSubject<any>(null);
  firebaseUser$ = new BehaviorSubject<any>(null);
  user$ = new BehaviorSubject<any>(null);

  googleLoginInProgress$ = new BehaviorSubject<boolean>(false);

  constructor(
    public jwtHelper: JwtHelperService,
    public afAuth: AngularFireAuth,
    private router: Router,
    private http: HttpClient
  ) {
    this.authUrl = environment.API_BASE_URL + 'api/Auth';

    afAuth.authState.subscribe((user) => {
      this.firebaseUser$.next(user);
      if (user) {
        user.getIdToken(true).then((token) => {
          this.firebaseToken$.next({...user, token});
        });
      } else {
        this.firebaseToken$.next(null);
      }
    });

    const googleLoginStatus = sessionStorage.getItem('googleLoginStatus');
    this.googleLoginStatus(googleLoginStatus?.toLowerCase() === 'true');

    const user = JSON.parse((localStorage.getItem('user') || null ) as any);
    this.user$.next(user);
  }

  /**
   * Sign in to using gmail.
   * After successful sign in, the token will be used to authenticate/login to ExpenseTracker API.
   * The ExpenseTracker API will provide a new token which will be the one to use for all the succeeding calls
   */
  public signInViaGoogle() {
    this.googleLoginStatus(true);

    this.afAuth
      .signInWithRedirect(new GoogleAuthProvider())
      .then((result) => {
      })
      .catch((error) => {
      });
  }

  /**
   * Signout
   */
  public signOut() {
    this.afAuth.signOut().then(() => {
      this.googleLoginStatus(false);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      this.firebaseToken$.next(null);
      this.user$.next(null);
      this.router.navigate(['login']);
    });
  }

  public login(token: string) {
    return this.http.post<AuthRequestResult>(`${this.authUrl}/login`, { token });
  }

  public isAuthenticated() {
    const token = localStorage.getItem('accessToken');

    // return !!token && !this.jwtHelper.isTokenExpired(token);
    return !!token;
  }

  public googleLoginStatus(status: boolean) {
    sessionStorage.setItem('googleLoginStatus', status?.toString());
    this.googleLoginInProgress$.next(status);
  }
}
