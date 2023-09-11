import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable, map, of, tap } from 'rxjs';
import { TotalAmountPerCategoryPerDate } from 'src/app/summary/model/total-amount-per-category-per-date';
import { AuthService } from 'src/app/shared/data-access/auth.service';
import { SummaryResult } from 'src/app/shared/model/summary-result.model';
import { TotalPerCategory } from 'src/app/shared/model/total-per-category.mode';
import { TotalPerDate } from 'src/app/shared/model/total-per-date';

@Injectable({
  providedIn: 'root',
})
export class SummaryService {
  baseUrl: string;

  private dailyTotal$ = new BehaviorSubject<TotalPerDate[]>([]);
  private cache = new Map();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.baseUrl = environment.API_BASE_URL + 'api/Summary';

    // authService.isAuthenticated$.subscribe((isAuth) => {
    //   if (!isAuth) {
    //     this.dailyTotal$.next([]);
    //     this.cache.clear();
    //   }
    // });
  }

  getTotalAmountPerCategory(
    startDate: string,
    endDate: string,
    forceUpdate = false
  ) {
    const cacheKey = `totalPerCategory-${startDate}-${endDate}`;
    if (this.cache.has(cacheKey) && !forceUpdate) {
      const value = this.cache.get(cacheKey) as TotalPerCategory[];
      return of(value);
    } else {
      return this.http
        .get<TotalPerCategory[]>(`${this.baseUrl}/GetTotalAmountPerCategory`, {
          params: {
            startDate,
            endDate,
          },
        })
        .pipe(
          tap((result) => {
            this.cache.set(cacheKey, result);
          })
        );
    }
  }

  getSummaryByRange(startDate: string, endDate: string) {
    return this.http.get<SummaryResult[]>(`${this.baseUrl}/GetSummaryByRange`, {
      params: {
        startDate,
        endDate,
      },
    });
  }

  getMonthlySummaryByYear(year: number) {
    return this.http.get<SummaryResult[]>(`${this.baseUrl}/GetSummaryByRange`, {
      params: { year },
    });
  }

  fetchDailyTotalByDateRange(
    startDate: string,
    endDate: string,
    forceUpdate = false
  ): void {
    // cache key will be the start date and end date - this will be checked if the same parameter is being used so
    // the cached value will be returned instead of repetitive api requests
    const cacheKey = `dailyTotal-${startDate}-${endDate}`;
    if (this.cache.has(cacheKey) && !forceUpdate) {
      const value = this.cache.get(cacheKey) as TotalPerDate[];
      this.dailyTotal$.next(value);
    } else {
      this.http
        .get<TotalPerDate[]>(`${this.baseUrl}/GetDailyTotalByDateRange`, {
          params: {
            startDate,
            endDate,
          },
        })
        .subscribe((result) => {
          this.cache.set(cacheKey, result);
          this.dailyTotal$.next(result);
        });
    }
  }

  getDailyTotalByDateRange(): Observable<TotalPerDate[]> {
    return this.dailyTotal$;
  }

  getTotalAmountPerCategoryPerDate(
    startDate: string,
    endDate: string,
    forceUpdate = false
  ): Observable<TotalAmountPerCategoryPerDate[]> {
    const cacheKey = `totalPerCategoryPerDate-${startDate}-${endDate}`;
    if (this.cache.has(cacheKey) && !forceUpdate) {
      const value = this.cache.get(cacheKey) as TotalAmountPerCategoryPerDate[];
      return of(value);
    } else {
      return this.http
        .get<TotalAmountPerCategoryPerDate[]>(
          `${this.baseUrl}/GetTotalAmountPerCategoryGroupByDate`,
          {
            params: {
              startDate,
              endDate,
            },
          }
        )
        .pipe(
          tap((result) => {
            this.cache.set(cacheKey, result);
          })
        );
    }
  }

  clearCache() {
    this.cache.clear();
  }
}
