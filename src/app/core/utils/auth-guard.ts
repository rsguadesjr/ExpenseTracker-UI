import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { isAuthenticated } from 'src/app/state/auth/auth.selector';

@Injectable()
export class AuthGuard implements CanActivate {
  private store = inject(Store);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.store.select(isAuthenticated).pipe(
      map((authenticated) => {
        if (!authenticated) {
          this.router.navigate(['login'], {
            queryParams: { returnUrl: state.url },
          });
          return false;
        }
        return authenticated;
      })
    );
  }
}
