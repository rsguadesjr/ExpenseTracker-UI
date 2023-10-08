import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  autoLogin,
  login,
  loginError,
  loginSuccess,
  loginWithEmailAndPassword,
  logout,
  registerError,
  registerSuccess,
  registerWithEmailAndPassword,
} from './auth.action';
import { catchError, from, map, of, switchMap } from 'rxjs';
import { AuthHelper } from 'src/app/core/utils/auth-helper';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/data-access/auth.service';

@Injectable()
export class AuthEffects {
  private action$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  login$ = createEffect(() =>
    this.action$.pipe(
      ofType(login),
      switchMap(({ idToken, provider }) => {
        return this.authService.login(idToken).pipe(
          map((result) => {
            if (result.isEmailVeriried) {
            }
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

  registerWithEmailAndPassword$ = createEffect(() =>
    this.action$.pipe(
      ofType(registerWithEmailAndPassword),
      switchMap(({ data }) => {
        return this.authService.register(data).pipe(
          map((result) => {
            if (result.isSuccess) {
              return registerSuccess({ data: result });
            }
            return registerError({
              error: 'Unauthorized Access. Please contact admin for access.',
            });
          }),

          catchError((error) => of(registerError({ error })))
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

  loginRedirect$ = createEffect(
    () =>
      this.action$.pipe(
        ofType(loginSuccess),
        map(() => {
          if (this.router.url.includes('/login')) {
            const returnUrl =
              this.route.snapshot.queryParams['returnUrl'] || '/';
            this.router.navigateByUrl(returnUrl);
          }
        })
      ),
    { dispatch: false }
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

  loginRedirectAfterRegister$ = createEffect(
    () =>
      this.action$.pipe(
        ofType(registerSuccess),
        map(() => {
          this.router.navigateByUrl('/login');
        })
      ),
    { dispatch: false }
  );
}
