import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { user } from 'src/app/state/auth/auth.selector';

@Injectable()
export class RoleGuard implements CanActivate {
  private store = inject(Store);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.store.select(user).pipe(
      map((authData) => {
        if (!authData) return false;

        const allowedRoles: string[] = route.data['role'] || [];
        if (allowedRoles.find((x) => authData.role.includes(x))) {
          return true;
        } else {
          return false;
        }
      })
    );

    // if (!this.authService.isAuthenticated()) return false;

    // const user = this.authService.getAuthData();
    // const allowedRoles: string[] = route.data['role'] || [];
    // if (allowedRoles.find((x) => user?.role.includes(x))) {
    //   return true;
    // } else {
    //   this.router.navigateByUrl('');
    // }

    // return false;
  }
}
