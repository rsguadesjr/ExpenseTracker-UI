import { AuthState } from './auth/auth.reducer';
import { BudgetState } from './budgets/budget.reducer';
import { CategoryState } from './categories/categories.reducer';
import { ExpenseState } from './expenses/expenses.reducer';
import { ReminderState } from './reminders/reminders.reducer';
import { SourceState } from './sources/sources.reducer';

export interface AppState {
  expenses: ExpenseState;
  reminders: ReminderState;
  categories: CategoryState;
  sources: SourceState;
  budgets: BudgetState;
  auth: AuthState;
}
