import { ExpenseState } from "./expenses/expenses.reducer";
import { ReminderState } from "./reminders/reminders.reducer";

export interface AppState {
  expenses: ExpenseState;
  reminders: ReminderState;
}
