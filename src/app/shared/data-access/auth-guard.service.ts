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
    console.log('[DEBUG] isAuthenticated', this.authService.isAuthenticated())
    if (this.authService.isAuthenticated())
      return true;


    return this.authService.refreshToken().pipe(
      map(value => {
        if (!value) {
          this.router.navigate(['login'], { queryParams: { returnUrl: state.url }});
        }

        return value;
      })
    )
  }
}
