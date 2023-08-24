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
export class RoleGuard implements CanActivate {
  constructor(
    public authService: AuthService,
    public router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log('[DEBUG] user', this.authService.getUserData());
    if (!this.authService.isAuthenticated())
      return false;


    const user = this.authService.getUserData();
    const allowedRoles: string[] = route.data['role'] || [];
    if (allowedRoles.find(x => user.Role.includes(x))) {
      return true;
    }
    else {
      this.router.navigateByUrl('');
    }

    return false;
  }
}
