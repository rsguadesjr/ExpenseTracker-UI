import { environment } from './../../../environments/environment';
import { BehaviorSubject, Observable, Subject, catchError, map, tap, throwError } from 'rxjs';
import { Injectable, inject } from '@angular/core';
import { Expense } from '../model/expense.model';
import { HttpClient } from '@angular/common/http';
import { ExpenseDto } from '../model/expense-dto.model';
import { PaginatedList } from 'src/app/shared/model/paginated-list.model';
import { ResponseData } from '../../shared/model/response-data';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private http = inject(HttpClient);
  private baseUrl = environment.API_BASE_URL + 'api/expenses';

  getExpenses(params: any): Observable<PaginatedList<Expense>> {
    return this.http.post<PaginatedList<Expense>>(`${this.baseUrl}/GetExpenses`, params)
  }

  getExpense(id: string): Observable<ExpenseDto> {
    return this.http.get<ExpenseDto>(`${this.baseUrl}/${id}`);
  }

  createExpense(data: ExpenseDto) {
    return this.http.post<Expense>(`${this.baseUrl}`, data);
  }

  updateExpense(id: string, data: ExpenseDto) {
    return this.http.put<Expense>(`${this.baseUrl}/${id}`, data);
  }

  deleteExpense(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

}
