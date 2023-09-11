import {
  HttpErrorResponse,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpStatusCode,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  filter,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { AuthService } from '../data-access/auth.service';
import { Store } from '@ngrx/store';
import { loginSuccess } from 'src/app/state/auth/auth.action';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
  private store = inject(Store);

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    let authReq = req;
    let token = this.authService.getAccessToken();
    if (token) {
      authReq = this.addTokenHeader(req, token);
    }

    return next.handle(authReq).pipe(
      catchError((httpErrorResponse: HttpErrorResponse) => {
        if (
          !req.url.toLowerCase().includes('api/auth/login') &&
          httpErrorResponse.status === HttpStatusCode.Unauthorized
        ) {
          return this.handle401Error(authReq, next);
        }

        return throwError(() => httpErrorResponse);
      })
    );
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((token) => {
          this.isRefreshing = false;

          this.authService.setAuthData(token);
          const user = this.authService.getAuthData();
          this.store.dispatch(loginSuccess({ user }));

          this.refreshTokenSubject.next(token);
          return next.handle(this.addTokenHeader(req, token));
        }),
        catchError((error) => {
          this.isRefreshing = false;

          this.authService.signOut();
          return throwError(() => error);
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter((token) => !!token),
      take(1),
      switchMap((token) => next.handle(this.addTokenHeader(req, token)))
    );
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`),
    });
  }
}
