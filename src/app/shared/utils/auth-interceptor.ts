import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, from, lastValueFrom, tap } from 'rxjs';
import { AuthService } from '../data-access/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private jwtHelper: JwtHelperService, private authService: AuthService) { }
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

    return from(this.handle(req, next));
  }

  private async handle(req: HttpRequest<any>, next: HttpHandler) {
    // Get the auth token from the service.
    let accessToken: string = localStorage.getItem('accessToken') || '';

    if (accessToken) {
      if (this.jwtHelper.isTokenExpired(accessToken)) {
        accessToken = await this.authService.firebaseUser$?.value?.getIdToken(true);
        localStorage.setItem('accessToken', accessToken ?? '');
      }
      console.log('[DEBUG] AuthInterceptor 2', {
        decodedToken:  this.jwtHelper.decodeToken(accessToken),
        isTokenExpired: this.jwtHelper.isTokenExpired(accessToken)
      })
    }

    // Clone the request and replace the original headers with
    // cloned headers, updated with the authorization.
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${accessToken ?? ''}`)
    });

    // send cloned request with header to the next handler.
    return await lastValueFrom(next.handle(authReq));
  }
}

