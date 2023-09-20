import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CacheResolverService {
  private cache = new Map<String, [Date, HttpResponse<any>]>();

  set(key: string, value: any, timeToLive: number | null = null) {
    console.log('[CacheResolverService] set', { key, value, timeToLive });
    if (timeToLive) {
      const expireseIn = new Date();
      expireseIn.setSeconds(expireseIn.getSeconds() + timeToLive);
      this.cache.set(key, [expireseIn, value]);
    } else {
      this.cache.set(key, value);
    }
  }

  get(key: string) {
    const value = this.cache.get(key);

    console.log('[CacheResolverService] get', { value });
    if (!value) return null;

    const [expireseIn, httpResponse] = value;
    const now = new Date();

    if (expireseIn && expireseIn.getTime() < now.getTime()) {
      this.cache.delete(key);
      return null;
    }

    return httpResponse;
  }
}
