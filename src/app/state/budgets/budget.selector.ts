import { createSelector } from "@ngrx/store";
import { AppState } from "../app.state";
import { BudgetState } from "./budget.reducer";


export const selectBudgets = (state: AppState) => state.budgets;

export const selectAllBudgets = createSelector(
  selectBudgets,
  (state: BudgetState) => state.budgets
)

export const savingStatus = createSelector(
  selectBudgets,
  (state: BudgetState) => state.savingStatus
)
