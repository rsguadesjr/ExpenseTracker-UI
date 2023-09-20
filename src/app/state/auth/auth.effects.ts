import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AuthService } from 'src/app/shared/data-access/auth.service';
import {
  autoLogin,
  login,
  loginError,
  loginSuccess,
  loginWithEmailAndPassword,
  logout,
  refreshAuth,
} from './auth.action';
import { catchError, from, map, of, switchMap, tap, throwError } from 'rxjs';
import { AuthHelper } from 'src/app/core/utils/auth-helper';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthData } from 'src/app/core/models/auth-data';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable()
export class AuthEffects {
  private action$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

  login$ = createEffect(() =>
    this.action$.pipe(
      ofType(login),
      switchMap(({ idToken, provider }) => {
        return this.authService.login(idToken).pipe(
          map((result) => {
            if (result.isAuthorized) {
              this.authService.setAuthData(result.token);
              const user = this.authService.getAuthData();
              return loginSuccess({ user });
            } else {
              return loginError({
                error: 'Unauthorized Access. Please contact admin for access.',
              });
            }
          }),
          catchError((error) => {
            const errorMsg = AuthHelper.getMessage(error);
            return of(loginError({ error: errorMsg }));
          })
        );
      })
    )
  );

  loginWithEmailAndPassword$ = createEffect(() =>
    this.action$.pipe(
      ofType(loginWithEmailAndPassword),
      switchMap(({ email, password }) => {
        return from(
          this.authService.signInWithEmailAndPassword(email, password)
        ).pipe(
          switchMap((result) => {
            if (result?.user) {
              return from(result.user?.getIdToken()).pipe(
                map((idToken) => {
                  return login({ idToken, provider: 'Email' });
                })
              );
            }

            return of();
          }),
          catchError((error) => {
            const errorMsg = AuthHelper.getMessage(error);
            return of(loginError({ error: errorMsg }));
          })
        );
      })
    )
  );

  autoLogin$ = createEffect(() =>
    this.action$.pipe(
      ofType(autoLogin),
      switchMap(() => {
        const user = this.authService.getAuthData();
        if (user) return of(loginSuccess({ user }));

        return of();
      })
    )
  );

  logout$ = createEffect(
    () =>
      this.action$.pipe(
        ofType(logout),
        map(() => {
          this.authService.signOut();

          const state = this.router.routerState.snapshot;
          this.router.navigate(['login'], {
            queryParams: { returnUrl: state?.url },
          });
        })
      ),
    { dispatch: false }
  );
}
