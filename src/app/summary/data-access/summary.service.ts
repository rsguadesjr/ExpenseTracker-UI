import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  private baseUrl: string;

  private dailyTotal$ = new BehaviorSubject<TotalPerDate[]>([]);

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
    refresh = false
  ) {
    const headers = new HttpHeaders();

    if (refresh) {
      headers.set('x-refresh', 'true');
    }

    return this.http.get<TotalPerCategory[]>(
      `${this.baseUrl}/GetTotalAmountPerCategory`,
      {
        params: {
          startDate,
          endDate,
        },
        headers,
      }
    );
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
    refresh = false
  ): void {
    let headers = new HttpHeaders();

    if (refresh) {
      headers = headers.set('x-refresh', 'true');
    }

    console.log('[SummaryService] fetchDailyTotalByDateRange', {
      headers,
      refresh,
    });

    this.http
      .get<TotalPerDate[]>(`${this.baseUrl}/GetDailyTotalByDateRange`, {
        params: {
          startDate,
          endDate,
        },
        headers,
      })
      .subscribe((result) => {
        this.dailyTotal$.next(result);
      });
  }

  getDailyTotalByDateRange(): Observable<TotalPerDate[]> {
    return this.dailyTotal$;
  }

  getTotalAmountPerCategoryPerDate(
    startDate: string,
    endDate: string,
    refresh = false
  ): Observable<TotalAmountPerCategoryPerDate[]> {
    const headers = new HttpHeaders();

    if (refresh) {
      headers.set('x-refresh', 'true');
    }

    return this.http.get<TotalAmountPerCategoryPerDate[]>(
      `${this.baseUrl}/GetTotalAmountPerCategoryGroupByDate`,
      {
        params: {
          startDate,
          endDate,
        },
        headers,
      }
    );
  }
}
