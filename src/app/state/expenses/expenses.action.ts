import { createAction, props } from '@ngrx/store';
import { ExpenseRequestModel } from 'src/app/expenses/model/expense-request.model';
import { ExpenseResponseModel } from 'src/app/expenses/model/expense-response.model';

/* #region Add Operation */
export const addExpense = createAction(
  '[Expense Page] Add Expense',
  props<{ data: ExpenseRequestModel }>()
);
export const addExpenseSuccess = createAction(
  '[Expense API] Add Expense Success',
  props<{ data: ExpenseResponseModel }>()
);
export const addExpenseError = createAction(
  '[Expense API] Add Expense Error',
  props<{ error: string }>()
);
/* #endregion */

/* #region Update Operation */
export const updateExpense = createAction(
  '[Expense Page] Update Expense',
  props<{ data: ExpenseRequestModel }>()
);
export const updateExpenseSuccess = createAction(
  '[Expense API] Update Expense Success',
  props<{ data: ExpenseResponseModel }>()
);
export const updateExpenseError = createAction(
  '[Expense API] Update Expense Error',
  props<{ error: string }>()
);
/* #endregion */

/* #region Delete Operation */
export const deleteExpense = createAction(
  '[Expense Page] Delete Expense',
  props<{ id: string }>()
);
export const deleteExpenseSuccess = createAction(
  '[Expense API] Delete Expense Success',
  props<{ id: string }>()
);
export const deleteExpenseError = createAction(
  '[Expense API] Delete Expense Error',
  props<{ error: string }>()
);

/* #region Load Operation */
export const loadExpenses = createAction(
  '[Expense Page] Load Expenses',
  props<{ params: any }>()
);
export const loadExpensesSuccess = createAction(
  '[Expense API] Load Expense Success',
  props<{ data: any[] }>()
);
export const loadExpensesError = createAction(
  '[Expense API] Load Expenses Error',
  props<{ error: string }>()
);
export const filterExpenses = createAction(
  '[Expense Page] Filter Expenses',
  props<{ filteredItems: ExpenseResponseModel[] }>()
);
/* #endregion */
