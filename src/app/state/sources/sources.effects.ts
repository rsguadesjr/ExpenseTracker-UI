import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';
import { SourceService } from 'src/app/shared/data-access/source.service';
import {
  addSource,
  addSourceError,
  addSourceSuccess,
  deleteSource,
  deleteSourceSuccess,
  loadSources,
  loadSourcesError,
  loadSourcesSuccess,
  updateSource,
  updateSourceError,
  updateSourceSuccess,
} from './sources.action';
import { catchError, from, map, of, switchMap } from 'rxjs';

@Injectable()
export class SourceEffects {
  actions$ = inject(Actions);
  store = inject(Store<AppState>);
  sourceService = inject(SourceService);

  loadSources$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadSources),
      switchMap(() => {
        return this.sourceService.getSources().pipe(
          map((result) => loadSourcesSuccess({ data: result })),

          catchError((error) => of(loadSourcesError({ error })))
        )
      }
      )
    )
  );

  addSource$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addSource),
      switchMap(({ data }) =>
        this.sourceService.create(data).pipe(
          map((result) => addSourceSuccess({ data: result })),

          catchError((error) => of(addSourceError({ error })))
        )
      )
    )
  );

  updateSource$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateSource),
      switchMap(({ data }) => {
        return this.sourceService.update(data).pipe(
          map((result) => updateSourceSuccess({ data: result })),

          catchError((error) => of(updateSourceError({ error })))
        );
      })
    )
  );

  deleteSource$ = createEffect(() =>
      this.actions$.pipe(
        ofType(deleteSource),
        switchMap(({ id }) => {
          return this.sourceService.delete(id).pipe(
            map(() => deleteSourceSuccess({ id })),

            catchError((error) => of(updateSourceError({ error })))
          );
        })
      )
  );
}
