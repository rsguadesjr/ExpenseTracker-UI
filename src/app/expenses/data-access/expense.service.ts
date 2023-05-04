import { environment } from './../../../environments/environment';
import { BehaviorSubject, Observable, Subject, catchError, map, tap, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { Expense } from '../model/expense.model';
import { HttpClient } from '@angular/common/http';
import { ExpenseDto } from '../model/expense-dto.model';
import { PaginatedList } from 'src/app/shared/model/paginated-list.model';
import { ResponseData } from '../model/response-data';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  // TODO: move current logic to a store

  private baseUrl: string;
  private initialLoadedDone$ = new BehaviorSubject<boolean>(false);
  // private status$ = new BehaviorSubject<'LOADING' | 'SUCCESS' | 'ERROR'>('LOADING');
  // private expenses$ = new BehaviorSubject<Expense[]>([]);
  private expenseData$ = new BehaviorSubject<ResponseData<Expense[]>>({
    status: 'SUCCESS',
    data: [],
  });

  private previousParam?: string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.API_BASE_URL + 'api/expenses';
  }

  initExpenses(params: any) {
    if (this.previousParam == JSON.stringify(params)) {
      this.expenseData$.next({ status: 'SUCCESS', data: this.expenseData$.value?.data || [] });
    }
    else {
      this.expenseData$.next({ status: 'LOADING', data: [...this.expenseData$.value.data] });
      this.http.post<PaginatedList<Expense>>(`${this.baseUrl}/GetExpenses`, params)
        .pipe(
          tap(x => {
            this.expenseData$.next({ status: 'LOADING', data: [] });
          })
        )
        .subscribe({
          next: (result) => {
            this.initialLoadedDone$.next(true);
            // this.expenses$.next(result.data);

            this.expenseData$.next({ status: 'SUCCESS', data: result.data });
          },
          error: (error) => {
            this.initialLoadedDone$.next(true);
            this.expenseData$.next({ status: 'ERROR', data: [] });
          }
        })
    }

    this.previousParam = JSON.stringify(params);
  }

  hasExpensesLoaded() {
    return this.initialLoadedDone$.value;
  }


  getExpenseData(): Observable<ResponseData<Expense[]>> {
    return this.expenseData$;
  }

  getExpense(id: string): Observable<ExpenseDto> {
    return this.http.get<ExpenseDto>(`${this.baseUrl}/${id}`);
  }

  createExpense(data: ExpenseDto) {
    this.expenseData$.next({ status: 'LOADING', data: this.expenseData$.value.data});
    return this.http.post<Expense>(`${this.baseUrl}`, data)
              .pipe(
                tap(result => {
                  const updatedData =  [result, ...this.expenseData$.value.data];
                  this.expenseData$.next({ status: 'SUCCESS', data: updatedData });
                })
              );
  }

  updateExpense(id: string, data: ExpenseDto) {
    this.expenseData$.next({ status: 'LOADING', data: this.expenseData$.value.data});
    return this.http.put<Expense>(`${this.baseUrl}/${id}`, data)
              .pipe(
                tap(result => {

                  const updatedData =  [result, ...this.expenseData$.value.data.filter(x => x.id !== id)];
                  this.expenseData$.next({ status: 'SUCCESS', data: updatedData });
                })
              );
  }

  deleteExpense(id: string) {
    // track deleted entry
    const deleted = this.expenseData$.value.data.find(x => x.id === id);

    // update current list
    const updatedData =  [...this.expenseData$.value.data.filter(x => x.id !== id)];
    this.expenseData$.next({ status: 'LOADING', data: updatedData});

    return this.http.delete(`${this.baseUrl}/${id}`)
                .pipe(
                  tap(() => {
                    // update status only
                    this.expenseData$.next({ status: 'SUCCESS', data: updatedData });
                  }),
                  catchError((error) => {
                    // if error, add back the deleted entry
                    if (deleted) {
                      this.expenseData$.next({ status: 'ERROR', data: [deleted, ...updatedData] });
                    }

                    return throwError(() => error);
                  })
                );
  }

}
