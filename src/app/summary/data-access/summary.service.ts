import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TotalAmountPerCategoryPerDate } from '../model/total-amount-per-category-per-date';

@Injectable({
  providedIn: 'root'
})
export class SummaryService {

  private baseUrl: string;

  private summary$ = new BehaviorSubject<TotalAmountPerCategoryPerDate[]>([]);
  private summaryCache = new Map();

  constructor(private http: HttpClient) {
    this.baseUrl = environment.API_BASE_URL + 'api/Summary';
  }


  getTotalAmountPerCategoryPerDate(startDate: string, endDate: string, forceUpdate = false): Observable<TotalAmountPerCategoryPerDate[]> {
    const cacheKey = `${startDate}-${endDate}`;
    if (this.summaryCache.has(cacheKey) && !forceUpdate) {
      const value = this.summaryCache.get(cacheKey) as TotalAmountPerCategoryPerDate[];
      return of(value);
    }
    else {
      return this.http.get<TotalAmountPerCategoryPerDate[]>(`${this.baseUrl}/GetTotalAmountPerCategoryGroupByDate`, {
        params: {
          startDate,
          endDate
        }
      }).pipe(
        tap((result) => {
          this.summaryCache.set(cacheKey, result);
        })
      )
    }


  }
}
