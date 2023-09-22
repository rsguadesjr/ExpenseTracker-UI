import { environment } from './../../../environments/environment';
import { Observable } from 'rxjs';
import { Injectable, inject } from '@angular/core';
import { ExpenseResponseModel } from '../model/expense-response.model';
import { HttpClient } from '@angular/common/http';
import { ExpenseRequestModel } from '../model/expense-request.model';
import { PaginatedList } from 'src/app/shared/model/paginated-list.model';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private http = inject(HttpClient);
  private baseUrl = environment.API_BASE_URL + 'api/expenses';

  getExpenses(params: any): Observable<PaginatedList<ExpenseResponseModel>> {
    return this.http.post<PaginatedList<ExpenseResponseModel>>(
      `${this.baseUrl}/GetExpenses`,
      params
    );
  }

  getExpense(id: string): Observable<ExpenseRequestModel> {
    return this.http.get<ExpenseRequestModel>(`${this.baseUrl}/${id}`);
  }

  createExpense(data: ExpenseRequestModel) {
    return this.http.post<ExpenseResponseModel>(`${this.baseUrl}`, data);
  }

  updateExpense(data: ExpenseRequestModel) {
    return this.http.put<ExpenseResponseModel>(
      `${this.baseUrl}/${data.id}`,
      data
    );
  }

  deleteExpense(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
