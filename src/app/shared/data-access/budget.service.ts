import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BudgetResult } from '../model/budget-result';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private http = inject(HttpClient);
  private baseUrl = environment.API_BASE_URL + 'api/Budgets';

  getBudgets(): Observable<BudgetResult[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  create(data: any) {
    return this.http.post<BudgetResult>(`${this.baseUrl}`, data);
  }

  update(data: any) {
    return this.http.put<any>(`${this.baseUrl}/${data.id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

}
