import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TotalAmountPerCategoryPerDate } from '../model/total-amount-per-category-per-date';

@Injectable({
  providedIn: 'root'
})
export class SummaryService {

  private baseUrl: string;
  constructor(private http: HttpClient) {
    this.baseUrl = environment.API_BASE_URL + 'api/Summary';
  }



  getTotalAmountPerCategoryPerDate(startDate: string, endDate: string): Observable<TotalAmountPerCategoryPerDate[]> {
    return this.http.get<TotalAmountPerCategoryPerDate[]>(`${this.baseUrl}/GetTotalAmountPerCategoryGroupByDate`, {
      params: {
        startDate,
        endDate
      }
    });
  }
}
