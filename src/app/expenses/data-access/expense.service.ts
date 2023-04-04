import { environment } from './../../../environments/environment';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Expense } from '../model/expense.model';
import { HttpClient } from '@angular/common/http';
import { ExpenseDto } from '../model/expense-dto.model';
import { PaginatedList } from 'src/app/shared/model/paginated-list';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  baseUrl: string;
  constructor(private http: HttpClient) {
    this.baseUrl = environment.API_BASE_URL;
  }

  getExpenses(params: any) {
    return this.http.post<PaginatedList<Expense>>(`${this.baseUrl}api/expenses/GetExpenses`, params);
  }

  getExpense(id: string): Observable<ExpenseDto> {
    return this.http.get<ExpenseDto>(`${this.baseUrl}api/expenses/${id}`);
  }

  createExpense(data: ExpenseDto) {
    console.log('[DEBUG] createExpense', data);
    return this.http.post<Expense>(`${this.baseUrl}api/expenses`, data);
  }

  updateExpense(id: string, data: ExpenseDto) {
    return this.http.put<Expense>(`${this.baseUrl}api/expenses/${id}`, data);
  }

  deleteExpense(id: string) {
    return this.http.delete(`${this.baseUrl}api/expenses/${id}`);
  }
}
