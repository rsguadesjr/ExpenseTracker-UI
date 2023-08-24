import { createAction, props } from "@ngrx/store";

/* #region Add Operation */
export const addBudget = createAction(
  '[Budget Page] Add Budget',
  props<{ data: any }>()
)
export const addBudgetSuccess = createAction(
  '[Budget API] Add Budget Success',
  props<{ data: any }>()
)
export const addBudgetError = createAction(
  '[Budget API] Add Budget Error',
  props<{ error: string }>()
)
/* #endregion */


/* #region Update Operation */
export const updateBudget = createAction(
  '[Budget Page] Update Budget',
  props<{ data: any }>()
)
export const updateBudgetSuccess = createAction(
  '[Budget API] Update Budget Success',
  props<{ data: any }>()
)
export const updateBudgetError = createAction(
  '[Budget API] Update Budget Error',
  props<{ error: string }>()
)
/* #endregion */


/* #region Delete Operation */
export const deleteBudget = createAction(
  '[Budget Page] Delete Budget',
  props<{ id: number }>()
)
export const deleteBudgetSuccess = createAction(
  '[Budget API] Delete Budget Success',
  props<{ id: number }>()
)
export const deleteBudgetError = createAction(
  '[Budget API] Delete Budget Error',
  props<{ error: string }>()
)
/* #endregion */


/* #region Load Operation */
export const loadBudgets = createAction(
  '[Budget Page] Load Budgets'
)
export const loadBudgetsSuccess = createAction(
  '[Budget API] Load Budgets Success',
  props<{ data: any }>()
)
export const loadBudgetsError = createAction(
  '[Budget API] Load Budgets Error',
  props<{ error: string }>()
)
/* #endregion */
