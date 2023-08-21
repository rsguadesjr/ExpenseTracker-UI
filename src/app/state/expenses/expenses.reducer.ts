import { createReducer, on } from "@ngrx/store";
import { addExpense, addExpenseError, addExpenseSuccess, deleteExpense, deleteExpenseError, deleteExpenseSuccess, loadExpenses, loadExpensesError, loadExpensesSuccess, updateExpense, updateExpenseError, updateExpenseSuccess } from "./expenses.action";

export interface ExpenseState {
  expenses: any[];
  currentMonthExpenses: any[];
  selectedExpense: any,
  error: string | null;
  loadingStatus: 'pending' | 'loading' | 'error' | 'success';
  savingStatus: 'pending' |'in-progress' | 'error' | 'success';
}

export const initialState: ExpenseState = {
  expenses: [],
  selectedExpense: null,
  currentMonthExpenses: [],
  error: null,
  loadingStatus: 'pending',
  savingStatus: 'pending'
}


export const expenseReducer = createReducer(
  initialState,

  /* #region Add Operation */
  on(addExpense, (state, { data } ) => ({
    ...state,
    savingStatus: 'in-progress' as const
  })),

  on(addExpenseSuccess, (state, { data }) => ({
    ...state,
    expenses: [data, ...state.expenses],
    selectedExpense: data,
    savingStatus: 'success' as const
  })),

  on(addExpenseError, (state, { error }) => ({
    ...state,
    error,
    savingStatus: 'error' as const
  })),
  /* #endregion */


  /* #region Update Operation */
  on(updateExpense, (state, { data }) => ({
    ...state,
    savingStatus: 'in-progress' as const
  })),

  on(updateExpenseSuccess, (state, { data }) => {
    const expenses = [...state.expenses];
    const index = expenses.findIndex(x => x.id == data.id);
    if (index != -1)
      expenses[index] = data;

    return { ...state, expenses, selectedExpense: data, savingStatus: 'success' as const };
  }),

  on(updateExpenseError, (state, { error }) => ({
    ...state,
    error,
    savingStatus: 'error' as const
  })),
  /* #endregion */


  /* #region Delete Operation */
  on(deleteExpense, (state, { id }) => ({
    ...state,
    savingStatus: 'in-progress' as const
  })),

  on(deleteExpenseSuccess, (state, { id }) => ({
    ...state,
    expenses: state.expenses.filter(x => x.id !== id),
    savingStatus: 'success' as const
  })),

  on(deleteExpenseError, (state, { error }) => ({
    ...state,
    error,
    savingStatus: 'error' as const
  })),
  /* #endregion*/


  /* #region Load Operation */
  on(loadExpenses, (state) => ({
    ...state,
    loadingStatus: 'pending' as const
  })),

  on(loadExpensesSuccess, (state, { data }) => ({
    ...state,
    expenses: data,
    error: null,
    loadingStatus: 'success' as const
  })),

  on(loadExpensesError, (state, { error }) => ({
    ...state,
    error,
    loadingStatus: 'error' as const
  }))
  /* #endregion*/

)
