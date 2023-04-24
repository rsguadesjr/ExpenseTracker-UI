import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SummaryResult } from '../model/summary-result.model';
import { TotalPerCategory } from '../model/total-per-category.mode';
import { TotalPerDate } from '../model/total-per-date';


@Injectable({
  providedIn: 'root'
})
export class SummaryService {

  baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.API_BASE_URL + 'api/Summary';
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

  getDailyTotalByDateRange(startDate: string, endDate: string) {
    return this.http.get<TotalPerDate[]>(`${this.baseUrl}/GetDailyTotalByDateRange`, {
      params: {
        startDate,
        endDate
      }
    });
  }

}
