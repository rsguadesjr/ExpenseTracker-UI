import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';
import { BudgetService } from 'src/app/shared/data-access/budget.service';
import {
  addBudget,
  addBudgetError,
  addBudgetSuccess,
  deleteBudget,
  deleteBudgetSuccess,
  loadBudgets,
  loadBudgetsError,
  loadBudgetsSuccess,
  updateBudget,
  updateBudgetError,
  updateBudgetSuccess,
} from './budgets.action';
import { catchError, from, map, of, switchMap } from 'rxjs';

@Injectable()
export class BudgetEffects {
  actions$ = inject(Actions);
  store = inject(Store<AppState>);
  budgetService = inject(BudgetService);

  loadBudgets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadBudgets),
      switchMap(({ params }) => {
        return this.budgetService.getBudgets().pipe(
          map((result) => loadBudgetsSuccess({ data: result })),

          catchError((error) => of(loadBudgetsError({ error })))
        )
      }
      )
    )
  );

  addBudget$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addBudget),
      switchMap(({ data }) =>
        this.budgetService.create(data).pipe(
          map((result) => addBudgetSuccess({ data: result })),

          catchError((error) => of(addBudgetError({ error })))
        )
      )
    )
  );

  updateBudget$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateBudget),
      switchMap(({ data }) => {
        return this.budgetService.update(data).pipe(
          map((result) => updateBudgetSuccess({ data: result })),

          catchError((error) => of(updateBudgetError({ error })))
        );
      })
    )
  );

  deleteBudget$ = createEffect(() =>
      this.actions$.pipe(
        ofType(deleteBudget),
        switchMap(({ id }) => {
          return this.budgetService.delete(id).pipe(
            map(() => deleteBudgetSuccess({ id })),

            catchError((error) => of(updateBudgetError({ error })))
          );
        })
      )
  );
}
