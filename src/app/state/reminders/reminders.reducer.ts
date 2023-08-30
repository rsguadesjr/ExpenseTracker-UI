import { createReducer, on } from '@ngrx/store';
import {
  addReminder,
  addReminderError,
  addReminderSuccess,
  deleteReminder,
  deleteReminderError,
  deleteReminderSuccess,
  loadReminders,
  loadRemindersError,
  loadRemindersSuccess,
  updateReminder,
  updateReminderError,
  updateReminderSuccess,
} from './reminders.action';

export interface ReminderState {
  reminders: any[];
  selectedReminder: any;
  error: string | null;
  loadingStatus: 'pending' | 'loading' | 'error' | 'success';
  savingStatus: 'pending' | 'in-progress' | 'error' | 'success';
}

export const initialState: ReminderState = {
  reminders: [],
  selectedReminder: null,
  error: null,
  loadingStatus: 'pending',
  savingStatus: 'pending',
};

export const reminderReducer = createReducer(
  initialState,

  /* #region Add Operation */
  on(addReminder, (state, { data }) => ({
    ...state,
    savingStatus: 'in-progress' as const,
  })),

  on(addReminderSuccess, (state, { data }) => ({
    ...state,
    reminders: [data, ...state.reminders],
    selectedReminder: data,
    savingStatus: 'success' as const,
  })),

  on(addReminderError, (state, { error }) => ({
    ...state,
    error,
    savingStatus: 'error' as const,
  })),
  /* #endregion */

  /* #region Update Operation */
  on(updateReminder, (state, { data }) => ({
    ...state,
    savingStatus: 'in-progress' as const,
  })),

  on(updateReminderSuccess, (state, { data }) => {
    const reminders = [...state.reminders];
    const index = reminders.findIndex((x) => x.id == data.id);
    if (index != -1) reminders[index] = data;

    return {
      ...state,
      reminders,
      selectedReminder: data,
      savingStatus: 'success' as const,
    };
  }),

  on(updateReminderError, (state, { error }) => ({
    ...state,
    error,
    savingStatus: 'error' as const,
  })),
  /* #endregion */

  /* #region Delete Operation */
  on(deleteReminder, (state, { id }) => ({
    ...state,
    savingStatus: 'in-progress' as const,
  })),

  on(deleteReminderSuccess, (state, { id }) => ({
    ...state,
    reminders: state.reminders.filter((x) => x.id !== id),
    savingStatus: 'success' as const,
  })),

  on(deleteReminderError, (state, { error }) => ({
    ...state,
    error,
    savingStatus: 'error' as const,
  })),
  /* #endregion*/

  /* #region Load Operation */
  on(loadReminders, (state) => ({
    ...state,
    loadingStatus: 'pending' as const,
  })),

  on(loadRemindersSuccess, (state, { data }) => ({
    ...state,
    reminders: data,
    error: null,
    loadingStatus: 'success' as const,
  })),

  on(loadRemindersError, (state, { error }) => ({
    ...state,
    error,
    loadingStatus: 'error' as const,
  }))
  /* #endregion*/
);
