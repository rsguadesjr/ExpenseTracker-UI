import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { JwtHelperService } from '@auth0/angular-jwt';
import { GoogleAuthProvider, User } from 'firebase/auth';
import { Observable } from 'rxjs';

// TODO: actual token will have to come from the API,
// after google authentication, the token will be used to login to API and the API will then send the actual token
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<any>;

  constructor(
    public jwtHelper: JwtHelperService,
    public afAuth: AngularFireAuth,
    private router: Router
  ) {
    this.user$ = afAuth.authState;
    afAuth.authState.subscribe((user) => {
      if (user) {
        user.getIdToken(true).then(x => {
          localStorage.setItem('access_token', x);
        })
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
      }
    });

    this.user$.subscribe(v => {
      console.log('[DEBUG] user2', v);
    })
  }

  public signInViaGoogle() {
    this.afAuth
      .signInWithRedirect(new GoogleAuthProvider())
      .then((result) => {
        console.log('[DEBUG] signInWithRedirect', result);
      })
      .catch((error) => {
        console.log('[DEBUG] signInWithRedirect', error);
      });
  }

  public signOut() {
    this.afAuth.signOut().then(() => {
      console.log('[DEBUG] signout');
      localStorage.removeItem('token');
      this.router.navigate(['login']);
    });
  }

  public isAuthenticated() {
    const token = localStorage.getItem('token');

    // return !!token && !this.jwtHelper.isTokenExpired(token);
    return !!token;
  }
}
