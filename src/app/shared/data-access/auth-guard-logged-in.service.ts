import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from './auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardLoggedIn implements CanActivate {
  constructor(
    public authService: AuthService,
    public router: Router,
    private route: ActivatedRoute,
    private afAuth: AngularFireAuth
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
