import { createSelector } from "@ngrx/store";
import { AppState } from "../app.state";
import { CategoryState } from "./categories.reducer";

export const selectCategories = (state: AppState) => state.categories;

export const selectAllCategories = createSelector(
  selectCategories,
  (state: CategoryState) => state.categories
)

export const selectAllActiveCategories = createSelector(
  selectCategories,
  (state: CategoryState) => state.categories.filter(c => c.isActive)
)

export const savingStatus = createSelector(
  selectCategories,
  (state: CategoryState) => state.savingStatus
)
