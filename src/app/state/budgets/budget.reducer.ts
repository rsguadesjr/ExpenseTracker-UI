import { createReducer, on } from "@ngrx/store";
import { addBudget, addBudgetError, addBudgetSuccess, deleteBudget, deleteBudgetError, deleteBudgetSuccess, loadBudgets, loadBudgetsError, loadBudgetsSuccess, updateBudget, updateBudgetError, updateBudgetSuccess } from "./budgets.action";

export interface BudgetState {
  budgets: any[];
  selectedBudget: any;
  error: string | null;
  loadingStatus: 'pending' | 'loading' | 'error' | 'success';
  savingStatus: 'pending' |'in-progress' | 'error' | 'success';
}


export const initialState: BudgetState = {
  budgets: [],
  selectedBudget: null,
  error: null,
  loadingStatus: 'pending',
  savingStatus: 'pending'
}


export const budgetReducer = createReducer(
  initialState,

  /* #region Add Operation */
  on(addBudget, (state, { data } ) => ({
    ...state,
    savingStatus: 'in-progress' as const
  })),

  on(addBudgetSuccess, (state, { data }) => ({
    ...state,
    budgets: [data, ...state.budgets],
    selectedBudget: data,
    savingStatus: 'success' as const
  })),

  on(addBudgetError, (state, { error }) => ({
    ...state,
    error,
    savingStatus: 'error' as const
  })),
  /* #endregion */


  /* #region Update Operation */
  on(updateBudget, (state, { data }) => ({
    ...state,
    savingStatus: 'in-progress' as const
  })),

  on(updateBudgetSuccess, (state, { data }) => {
    const budgets = [...state.budgets];
    const index = budgets.findIndex(x => x.id == data.id);
    if (index != -1)
      budgets[index] = data;

    return { ...state, budgets, selectedBudget: data, savingStatus: 'success' as const };
  }),

  on(updateBudgetError, (state, { error }) => ({
    ...state,
    error,
    savingStatus: 'error' as const
  })),
  /* #endregion */


  /* #region Delete Operation */
  on(deleteBudget, (state, { id }) => ({
    ...state,
    savingStatus: 'in-progress' as const
  })),

  on(deleteBudgetSuccess, (state, { id }) => ({
    ...state,
    budgets: state.budgets.filter(x => x.id !== id),
    savingStatus: 'success' as const
  })),

  on(deleteBudgetError, (state, { error }) => ({
    ...state,
    error,
    savingStatus: 'error' as const
  })),
  /* #endregion*/


  /* #region Load Operation */
  on(loadBudgets, (state) => ({
    ...state,
    loadingStatus: 'pending' as const
  })),

  on(loadBudgetsSuccess, (state, { data }) => ({
    ...state,
    budgets: data,
    error: null,
    loadingStatus: 'success' as const
  })),

  on(loadBudgetsError, (state, { error }) => ({
    ...state,
    error,
    loadingStatus: 'error' as const
  }))
  /* #endregion*/

)
