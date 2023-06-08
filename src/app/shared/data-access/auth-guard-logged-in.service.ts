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
    // return this.authService.user$.pipe(
    //   take(1),
    //   map((user) => {
    //     if (user) {
    //       const urlRedirect = route.queryParams['returnUrl'] || '/';
    //       this.router.navigateByUrl(urlRedirect)
    //       return true;
    //     }

    //     return true;
    //   })
    // );
    console.log('[DEBUG] AuthGuard 1', {
      state,
      user: await this.afAuth.currentUser,
      isAuth: this.authService.isAuthenticated()
    })
    this.afAuth.authState.subscribe(result => {
      result?.getIdToken
      console.log('[DEBUG] AuthGuard 1.2', {
        state,
        user: result,
        isAuth: this.authService.isAuthenticated()
      })
    })

    if (this.authService.isAuthenticated()) {
      // this.router.navigate([''], { queryParams: { returnUrl: state.url }});
      const urlRedirect = route.queryParams['returnUrl'] || '/';
      this.router.navigateByUrl(urlRedirect)
      return false;
    }

    return true;
  }

}
