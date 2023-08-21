import { createAction, props } from "@ngrx/store";

/* #region Add Operation */
export const addReminder = createAction(
  '[Reminder Page] Add Reminder',
  props<{ data: any }>()
)
export const addReminderSuccess = createAction(
  '[Reminder API] Add Reminder Success',
  props<{ data: any }>()
)
export const addReminderError = createAction(
  '[Reminder API] Add Reminder Error',
  props<{ error: string }>()
)
/* #endregion */


/* #region Update Operation */
export const updateReminder = createAction(
  '[Reminder Page] Update Reminder',
  props<{ data: any }>()
)
export const updateReminderSuccess = createAction(
  '[Reminder API] Update Reminder Success',
  props<{ data: any }>()
)
export const updateReminderError = createAction(
  '[Reminder API] Update Reminder Error',
  props<{ error: string }>()
)
/* #endregion */


/* #region Delete Operation */
export const deleteReminder = createAction(
  '[Reminder Page] Delete Reminder',
  props<{ id: number }>()
)
export const deleteReminderSuccess = createAction(
  '[Reminder API] Delete Reminder Success',
  props<{ id: number }>()
)
export const deleteReminderError = createAction(
  '[Reminder API] Delete Reminder Error',
  props<{ error: string }>()
)
/* #endregion */


/* #region Load Operation */
export const loadReminders = createAction(
  '[Reminder Page] Load Reminders',
  props<{ params: any }>()
)
export const loadRemindersSuccess = createAction(
  '[Reminder API] Load Reminders Success',
  props<{ data: any }>()
)
export const loadRemindersError = createAction(
  '[Reminder API] Load Reminders Error',
  props<{ error: string }>()
)
/* #endregion */
