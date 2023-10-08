import { createReducer, on } from '@ngrx/store';
import {
  addExpense,
  addExpenseError,
  addExpenseSuccess,
  deleteExpense,
  deleteExpenseError,
  deleteExpenseSuccess,
  loadExpenses,
  loadExpensesError,
  loadExpensesSuccess,
  resetState,
  updateExpense,
  updateExpenseError,
  updateExpenseSuccess,
  updateFilter,
} from './expenses.action';
import { ExpenseResponseModel } from 'src/app/expenses/model/expense-response.model';
import { TotalPerCategory } from 'src/app/shared/model/total-per-category.mode';
import { TotalAmountPerCategoryPerDate } from 'src/app/summary/model/total-amount-per-category-per-date';
import {
  endOfMonth,
  isAfter,
  isBefore,
  isSameMonth,
  startOfDay,
  startOfMonth,
} from 'date-fns';

const currentMonth = new Date();
export interface ExpenseState {
  currentMonthExpenses: ExpenseResponseModel[];
  expenses: ExpenseResponseModel[];
  filteredExpenses: ExpenseResponseModel[];
  selectedExpense: ExpenseResponseModel | null;
  error: string | null;
  loadingStatus: 'pending' | 'loading' | 'error' | 'success';
  savingStatus: 'pending' | 'in-progress' | 'error' | 'success';
  filterStartDate: Date;
  filterEndDate: Date;
}

export const initialState: ExpenseState = {
  currentMonthExpenses: [],
  expenses: [],
  filteredExpenses: [],
  selectedExpense: null,
  error: null,
  loadingStatus: 'pending',
  savingStatus: 'pending',
  filterStartDate: startOfMonth(currentMonth),
  filterEndDate: endOfMonth(currentMonth),
};

export const expenseReducer = createReducer(
  initialState,

  /* #region Add Operation */
  on(addExpense, (state) => ({
    ...state,
    savingStatus: 'in-progress' as const,
  })),

  on(addExpenseSuccess, (state, { data }) => {
    const expenseDate = new Date(data.expenseDate);
    let currentMonthExpenses = [...state.currentMonthExpenses];

    if (isSameMonth(expenseDate, currentMonth)) {
      currentMonthExpenses = [data, ...currentMonthExpenses];
    }

    return {
      ...state,
      expenses: [data, ...state.expenses],
      selectedExpense: data,
      currentMonthExpenses,
      savingStatus: 'success' as const,
    };
  }),

  on(addExpenseError, (state, { error }) => ({
    ...state,
    error,
    savingStatus: 'error' as const,
  })),
  /* #endregion */

  /* #region Update Operation */
  on(updateExpense, (state, { data }) => ({
    ...state,
    savingStatus: 'in-progress' as const,
  })),

  on(updateExpenseSuccess, (state, { data }) => {
    const expenseDate = new Date(data.expenseDate);
    const expenses = [...state.expenses];
    const index = expenses.findIndex((x) => x.id == data.id);
    if (index != -1) expenses[index] = data;

    const currentMonthExpenses = [...state.currentMonthExpenses];
    if (isSameMonth(expenseDate, currentMonth)) {
      const index = currentMonthExpenses.findIndex((x) => x.id == data.id);
      if (index != -1) currentMonthExpenses[index] = data;
    }

    return {
      ...state,
      expenses,
      currentMonthExpenses,
      selectedExpense: data,
      savingStatus: 'success' as const,
    };
  }),

  on(updateExpenseError, (state, { error }) => ({
    ...state,
    error,
    savingStatus: 'error' as const,
  })),
  /* #endregion */

  /* #region Delete Operation */
  on(deleteExpense, (state, { id }) => ({
    ...state,
    savingStatus: 'in-progress' as const,
  })),

  on(deleteExpenseSuccess, (state, { id }) => ({
    ...state,
    expenses: state.expenses.filter((x) => x.id !== id),
    currentMonthExpenses: state.currentMonthExpenses.filter((x) => x.id !== id),
    savingStatus: 'success' as const,
  })),

  on(deleteExpenseError, (state, { error }) => ({
    ...state,
    error,
    savingStatus: 'error' as const,
  })),
  /* #endregion*/

  /* #region Load Operation */
  on(loadExpenses, (state) => ({
    ...state,
    loadingStatus: 'pending' as const,
  })),

  on(loadExpensesSuccess, (state, { data }) => {
    let currentMonthExpenses = [...state.currentMonthExpenses];
    for (let exp of data) {
      const index = currentMonthExpenses.findIndex((x) => x.id === exp.id);
      if (index !== -1) {
        currentMonthExpenses[index] = exp;
      } else if (isSameMonth(new Date(exp.expenseDate), currentMonth)) {
        currentMonthExpenses.push(exp);
      }
    }

    return {
      ...state,
      expenses: data,
      currentMonthExpenses,
      filteredExpenses: data,
      error: null,
      loadingStatus: 'success' as const,
    };
  }),

  on(loadExpensesError, (state, { error }) => ({
    ...state,
    error,
    loadingStatus: 'error' as const,
  })),
  /* #endregion*/

  on(updateFilter, (state, { params }) => ({
    ...state,
    filterStartDate: params.startDate,
    filterEndDate: params.endDate,
  })),

  on(resetState, (state) => ({
    ...initialState,
  }))
);
