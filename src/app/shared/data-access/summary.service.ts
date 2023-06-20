import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SummaryResult } from '../model/summary-result.model';
import { TotalPerCategory } from '../model/total-per-category.mode';
import { TotalPerDate } from '../model/total-per-date';
import { BehaviorSubject, Observable, map, of } from 'rxjs';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class SummaryService {
  baseUrl: string;

  private dailyTotal$ = new BehaviorSubject<TotalPerDate[]>([]);
  private dailyTotalCache = new Map();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.baseUrl = environment.API_BASE_URL + 'api/Summary';

    authService.isAuthenticated$
      .subscribe(isAuth => {
        if (!isAuth) {
          this.dailyTotal$.next([]);
          this.dailyTotalCache.clear();
        }
      })
  }

  getTotalAmountPerCategory(startDate: string, endDate: string) {
    return this.http.get<TotalPerCategory[]>(`${this.baseUrl}/GetTotalAmountPerCategory`, {
      params: {
        startDate,
        endDate
      }
    });
  }

  getSummaryByRange(startDate: string, endDate: string) {
    return this.http.get<SummaryResult[]>(`${this.baseUrl}/GetSummaryByRange`, {
      params: {
        startDate,
        endDate
      }
    });
  }

  getMonthlySummaryByYear(year: number) {
    return this.http.get<SummaryResult[]>(`${this.baseUrl}/GetSummaryByRange`, {
      params: { year }
    });
  }


  fetchDailyTotalByDateRange(startDate: string, endDate: string, forceUpdate = false): void {
    // cache key will be the start date and end date - this will be checked if the same parameter is being used so
    // the cached value will be returned instead of repetitive api requests
    const cacheKey = `${startDate}-${endDate}`;
    if (this.dailyTotalCache.has(cacheKey) && !forceUpdate) {
      const value = this.dailyTotalCache.get(cacheKey) as TotalPerDate[];
      this.dailyTotal$.next(value);
    }
    else {
      this.http.get<TotalPerDate[]>(`${this.baseUrl}/GetDailyTotalByDateRange`, {
        params: {
          startDate,
          endDate
        }
      }).subscribe(result => {
        this.dailyTotalCache.set(cacheKey, result);
        this.dailyTotal$.next(result);
      })
    }
  }

  getDailyTotalByDateRange(): Observable<TotalPerDate[]> {
    return this.dailyTotal$;
  }


}
