import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';
import { ExpenseService } from 'src/app/expenses/data-access/expense.service';
import {
  addExpense,
  addExpenseError,
  addExpenseSuccess,
  deleteExpense,
  deleteExpenseSuccess,
  loadExpenses,
  loadExpensesError,
  loadExpensesSuccess,
  updateExpense,
  updateExpenseError,
  updateExpenseSuccess,
} from './expenses.action';
import { catchError, from, map, of, switchMap } from 'rxjs';

@Injectable()
export class ExpenseEffects {
  actions$ = inject(Actions);
  store = inject(Store<AppState>);
  expenseService = inject(ExpenseService);

  loadExpenses$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadExpenses),
      switchMap(({ params }) =>
        this.expenseService.getExpenses(params).pipe(
          map((result) => loadExpensesSuccess({ data: result.data })),

          catchError((error) => of(loadExpensesError({ error })))
        )
      )
    )
  );

  addExpense$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addExpense),
      switchMap(({ data }) =>
        this.expenseService.createExpense(data).pipe(
          map((result) => addExpenseSuccess({ data: result })),

          catchError((error) => of(addExpenseError({ error })))
        )
      )
    )
  );

  updateExpense$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateExpense),
      switchMap(({ data }) => {
        return this.expenseService.updateExpense(data.id, data).pipe(
          map((result) => updateExpenseSuccess({ data: result })),

          catchError((error) => of(updateExpenseError({ error })))
        );
      })
    )
  );

  deleteExpense$ = createEffect(() =>
      this.actions$.pipe(
        ofType(deleteExpense),
        switchMap(({ id }) => {
          return this.expenseService.deleteExpense(id).pipe(
            map(() => deleteExpenseSuccess({ id })),

            catchError((error) => of(updateExpenseError({ error })))
          );
        })
      )
  );
}
