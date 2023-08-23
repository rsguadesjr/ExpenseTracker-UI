import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';
import { CategoryService } from 'src/app/shared/data-access/category.service';
import {
  addCategory,
  addCategoryError,
  addCategorySuccess,
  deleteCategory,
  deleteCategorySuccess,
  loadCategories,
  loadCategoriesError,
  loadCategoriesSuccess,
  updateCategory,
  updateCategoryError,
  updateCategorySuccess,
} from './categories.action';
import { catchError, from, map, of, switchMap } from 'rxjs';

@Injectable()
export class CategoryEffects {
  actions$ = inject(Actions);
  store = inject(Store<AppState>);
  categoryService = inject(CategoryService);

  loadCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCategories),
      switchMap(() => {
        return this.categoryService.getCategories().pipe(
          map((result) => loadCategoriesSuccess({ data: result })),

          catchError((error) => of(loadCategoriesError({ error })))
        )
      }
      )
    )
  );

  addCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addCategory),
      switchMap(({ data }) =>
        this.categoryService.create(data).pipe(
          map((result) => addCategorySuccess({ data: result })),

          catchError((error) => of(addCategoryError({ error })))
        )
      )
    )
  );

  updateCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateCategory),
      switchMap(({ data }) => {
        return this.categoryService.update(data).pipe(
          map((result) => updateCategorySuccess({ data: result })),

          catchError((error) => of(updateCategoryError({ error })))
        );
      })
    )
  );

  deleteCategory$ = createEffect(() =>
      this.actions$.pipe(
        ofType(deleteCategory),
        switchMap(({ id }) => {
          return this.categoryService.delete(id).pipe(
            map(() => deleteCategorySuccess({ id })),

            catchError((error) => of(updateCategoryError({ error })))
          );
        })
      )
  );
}
