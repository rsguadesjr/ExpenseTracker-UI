import { createAction, props } from "@ngrx/store";

export const addExpense = createAction(
  '[Expense Page] Add Expense',
  props<{ data: any }>()
)

export const addExpenseSuccess = createAction(
  '[Expense API] Add Expense Success',
  props<{ data: any }>()
)

export const addExpenseError = createAction(
  '[Expense API] Add Expense Error',
  props<{ error: string }>()
)

export const updateExpense = createAction(
  '[Expense Page] Update Expense',
  props<{ data: any }>()
)

export const updateExpenseSuccess = createAction(
  '[Expense API] Update Expense Success',
  props<{ data: any }>()
)

export const updateExpenseError = createAction(
  '[Expense API] Update Expense Error',
  props<{ error: string }>()
)


export const deleteExpense = createAction(
  '[Expense Page] Delete Expense',
  props<{ id: string }>()
)

export const deleteErrore = createAction(
  '[Expense API] Delete Expense Error',
  props<{ error: string }>()
)

export const loadExpenses = createAction(
  '[Expense Page] Load Expenses',
  props<{ params: any }>()
)

export const loadExpensesSuccess = createAction(
  '[Expense API] Load Expense Success',
  props<{ data: any[] }>()
)


export const loadExpensesError = createAction(
  '[Expense API] Load Expenses Error',
  props<{ error: string }>()
)
