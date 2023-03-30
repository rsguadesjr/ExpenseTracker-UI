import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardLoggedIn implements CanActivate {
  constructor(
    public authService: AuthService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.authService.user$.pipe(
      take(1),
      map((user) => {
        if (user) {
          const urlRedirect = route.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(urlRedirect)
          return true;
        }

        return true;
      })
    );
    // if (!this.auth.isAuthenticated()) {
    //   this.router.navigate(['login'], { queryParams: { returnUrl: state.url }});
    //   return false;
    // }

    // return true;
  }

}
