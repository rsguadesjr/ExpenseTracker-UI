import { createSelector } from "@ngrx/store";
import { AppState } from "../app.state";
import { ReminderState } from "./reminders.reducer";
import { ReminderHelper } from "src/app/reminders/utils/reminder-helper";


export const selectReminders = (state: AppState) => state.reminders;

export const selectAllReminders = createSelector(
  selectReminders,
  (state: ReminderState) => state.reminders
)

export const selectFormattedReminders = (params: any) => createSelector(
  selectReminders,
  (state: ReminderState) => ReminderHelper.process(state.reminders, params)
)

export const selectDistinctFormattedReminders = (params: any) => createSelector(
  selectReminders,
  (state: ReminderState) => ReminderHelper.distinctReminders(state.reminders, params)
)

export const savingStatus = createSelector(
  selectReminders,
  (state: ReminderState) => state.savingStatus
)
