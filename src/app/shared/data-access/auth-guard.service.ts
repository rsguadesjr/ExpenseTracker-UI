import { Injectable } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivate,
  Route,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { map, mergeMap, Observable, of, switchMap, take } from 'rxjs';
import { AuthService } from './auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    public authService: AuthService,
    public router: Router,
    private route: ActivatedRoute,
    private jwtHelper: JwtHelperService,
    private afAuth: AngularFireAuth
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // return this.authService.user$.pipe(
    //   take(1),
    //   map((user) => {
    //     if (user) {
    //       return true;
    //     }

    //     this.router.navigate(['login'], {
    //       queryParams: { returnUrl: state.url },
    //     });
    //     return false;
    //   })
    // );


    // const test = this.authService.firebaseUser$.pipe(
    //   take(1),
    //   map((user) => {
    //       return true;


    //   })
    // )

    if (this.authService.isAuthenticated())
      return true;


    return this.authService.refresh().pipe(
      map(value => {
        if (!value) {
          this.router.navigate(['login'], { queryParams: { returnUrl: state.url }});
        }

        return value;
      })
    )

    // return this.authService.firebaseUser$.pipe(
    //   take(1),
    //   switchMap(async user => {
    //     console.log('[DEBUG] auth guard 1', {
    //       user,
    //       isAuthenticated: this.authService.isAuthenticated()
    //     });
    //     if (this.authService.isAuthenticated())
    //       return of(true)

    //     const idTokenResult = await user?.getIdTokenResult();
    //     console.log('[DEBUG] auth guard 2', {
    //       user,
    //       idTokenResult: idTokenResult
    //     });
    //     if (idTokenResult?.token) {
    //       return this.authService.login(idTokenResult.token)
    //         .pipe(
    //           map(value => !!value.token)
    //         )
    //     }

    //     return of(false);
    //   }),
    //   mergeMap(x => {
    //     console.log('[DEBUG] auth guard merge map', x);
    //     return x;
    //   })
    // )
    // console.log('[DEBUG] AuthGuard 1', {
    //   state,
    //   user: await this.afAuth.currentUser,
    //   isAuth: this.authService.isAuthenticated()
    // })

    // if (this.authService.isAuthenticated()) {
    //   return true;
    // }

    // const isRefreshSuccess = await this.authService.refreshToken();
    // console.log('[DEBUG] AuthGuard 2', isRefreshSuccess)
    // if (!isRefreshSuccess) {
    //   this.router.navigate(['login'], { queryParams: { returnUrl: state.url }});
    // }

    // return isRefreshSuccess;

    // // if (!this.authService.isAuthenticated()) {
    // //   this.router.navigate(['login'], { queryParams: { returnUrl: state.url }});
    // //   return false;
    // // }

    // // return true;
  }
}
