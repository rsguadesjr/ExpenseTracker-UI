import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'src/app/shared/data-access/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardLoggedIn implements CanActivate {
  constructor(
    public authService: AuthService,
    public router: Router
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authService.isAuthenticated()) {
      const urlRedirect = route.queryParams['returnUrl'] || '/';
      this.router.navigateByUrl(urlRedirect)
      return false;
    }

    return true;
  }

}
