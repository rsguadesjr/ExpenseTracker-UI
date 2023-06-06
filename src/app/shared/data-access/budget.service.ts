import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BudgetResult } from '../model/budget-result';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  baseUrl: string;
  private budgets$ = new BehaviorSubject<BudgetResult[]>([]);

  constructor(private http: HttpClient) {
    this.baseUrl = environment.API_BASE_URL + 'api/Budgets';
  }

  initBudgets() {
    this.http.get<any[]>(this.baseUrl).subscribe({
      next: (result) => this.budgets$.next(result),
    });
  }

  getBudgets(): Observable<BudgetResult[]> {
    return this.budgets$;
  }

  create(data: any) {
    return this.http.post<BudgetResult>(`${this.baseUrl}`, data)
              .pipe(
                tap(result => {
                  this.budgets$.next([result, ...this.budgets$.value]);
                })
              );
  }

  update(data: any) {
    return this.http.put<any>(`${this.baseUrl}/${data.id}`, data)
              .pipe(
                tap(result => {
                  const current = this.budgets$.value;
                  const index = this.budgets$.value.findIndex(x => x.id == data.id);
                  current[index] = result;
                  this.budgets$.next([...current]);
                })
              );
  }

  delete(id: number) {
    const copyOfList = this.budgets$.value.slice();
    const updateList = this.budgets$.value.filter(x => x.id !== id);
    this.budgets$.next([...updateList]);
    return this.http.delete(`${this.baseUrl}/${id}`)
      .pipe(
        tap(result => {
        }),
        catchError((error) => {
          this.budgets$.next([...copyOfList]);
          return throwError(() => error);
        })
      );
  }

}
