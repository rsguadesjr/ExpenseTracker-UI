import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpStatusCode,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import {
  Observable,
  catchError,
  from,
  lastValueFrom,
  map,
  tap,
  throwError,
} from 'rxjs';
import { AuthService } from '../data-access/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  retry = true;

  constructor(
    private jwtHelper: JwtHelperService,
    private authService: AuthService
  ) {}
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // // Get the auth token from the service.
    // const accessToken = localStorage.getItem('accessToken');

    // if (accessToken) {
    //   this.authService.firebaseUser$.value.getIdToken(true)
    //   .then((token: any) => {
    //     console.log('[DEBUG] AuthInterceptor 1', { token })
    //   })
    //   console.log('[DEBUG] AuthInterceptor 2', {
    //     decodedToken:  this.jwtHelper.decodeToken(accessToken),
    //     isTokenExpired: this.jwtHelper.isTokenExpired(accessToken)
    //   })
    // }

    // // Clone the request and replace the original headers with
    // // cloned headers, updated with the authorization.
    // const authReq = req.clone({
    //   headers: req.headers.set('Authorization', `Bearer ${accessToken ?? ''}`)
    // });

    // // send cloned request with header to the next handler.
    // return next.handle(authReq);

    return from(this.handle(req, next)).pipe(
      map((event: HttpEvent<any>) => {
        return event;
      }),
      catchError(
        (
          httpErrorResponse: HttpErrorResponse,
          _: Observable<HttpEvent<any>>
        ) => {
          console.log('[DEBUG] httpErrorResponse', {
            httpErrorResponse,
            retry: this.retry,
          })
          if (httpErrorResponse.status === HttpStatusCode.Unauthorized) {
            console.log('[DEBUG] retry', {
              httpErrorResponse,
              retry: this.retry,
            })
            if (this.retry) {
              this.retry = !this.retry;
              return from(this.handle(req, next, true))
                      .pipe(
                        catchError((
                          httpErrorResponse: HttpErrorResponse,
                          _: Observable<HttpEvent<any>>
                        )  => {
                          console.log('[DEBUG] Logout 2');
                          return throwError(() => httpErrorResponse);
                        })
                      )
            } else {
              this.retry = !this.retry;
              console.log('[DEBUG] Logout');
              // this.authService.signOut();
            }
          }
          return throwError(() => httpErrorResponse);
        }
      )
    );
  }


  private async handle(req: HttpRequest<any>, next: HttpHandler, forceRetry?: boolean) {
    console.log('[DEBUG] handle', {
      req,
      next,
      forceRetry
    })
    // Get the auth token from the service.
    let accessToken: string = localStorage.getItem('accessToken') || '';

    if (accessToken && (this.jwtHelper.isTokenExpired(accessToken) || forceRetry)) {
      accessToken = await this.authService.firebaseUser$?.value?.getIdToken(true);
      localStorage.setItem('accessToken', accessToken ?? '');
    }

    // Clone the request and replace the original headers with
    // cloned headers, updated with the authorization.
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${accessToken ?? ''}`),
    });

    // send cloned request with header to the next handler.
    return await lastValueFrom(next.handle(authReq));
  }
}
