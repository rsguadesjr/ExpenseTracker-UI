import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';
import { ReminderService } from 'src/app/reminders/data-access/reminder.service';
import {
  addReminder,
  addReminderError,
  addReminderSuccess,
  deleteReminder,
  deleteReminderSuccess,
  loadReminders,
  loadRemindersError,
  loadRemindersSuccess,
  updateReminder,
  updateReminderError,
  updateReminderSuccess,
} from './reminders.action';
import { catchError, from, map, of, switchMap } from 'rxjs';

@Injectable()
export class ReminderEffects {
  actions$ = inject(Actions);
  store = inject(Store<AppState>);
  reminderService = inject(ReminderService);

  loadReminders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadReminders),
      switchMap(({ params }) => {
        return this.reminderService.getReminders(params.startDate, params.endDate ).pipe(
          map((result) => loadRemindersSuccess({ data: result })),

          catchError((error) => of(loadRemindersError({ error })))
        )
      }
      )
    )
  );

  addReminder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addReminder),
      switchMap(({ data }) =>
        this.reminderService.createReminder(data).pipe(
          map((result) => addReminderSuccess({ data: result })),

          catchError((error) => of(addReminderError({ error })))
        )
      )
    )
  );

  updateReminder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateReminder),
      switchMap(({ data }) => {
        return this.reminderService.updateReminder(data.id, data).pipe(
          map((result) => updateReminderSuccess({ data: result })),

          catchError((error) => of(updateReminderError({ error })))
        );
      })
    )
  );

  deleteReminder$ = createEffect(() =>
      this.actions$.pipe(
        ofType(deleteReminder),
        switchMap(({ id }) => {
          return this.reminderService.deleteReminder(id).pipe(
            map(() => deleteReminderSuccess({ id })),

            catchError((error) => of(updateReminderError({ error })))
          );
        })
      )
  );
}
