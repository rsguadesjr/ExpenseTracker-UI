import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { CacheResolverService } from '../services/cache-resolver.service';

const CACHE_TIME_LIMIT = 120;
@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cacheResolver = inject(CacheResolverService);

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log('[CacheInterceptor]', req);
    if (req.method !== 'GET') {
      return next.handle(req);
    }

    if (req.headers.get('x-refresh')) {
      return this.sendRequest(req, next);
    }

    const cachedResponse = this.cacheResolver.get(req.url);
    return cachedResponse ? of(cachedResponse) : this.sendRequest(req, next);
  }

  sendRequest(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          this.cacheResolver.set(req.url, event, CACHE_TIME_LIMIT);
        }
      })
    );
  }
}
