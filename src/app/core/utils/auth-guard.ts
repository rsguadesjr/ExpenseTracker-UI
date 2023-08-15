import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from 'src/app/shared/data-access/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    public authService: AuthService,
    public router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
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
