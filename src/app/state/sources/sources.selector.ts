import { createSelector } from "@ngrx/store";
import { AppState } from "../app.state";
import { SourceState } from "./sources.reducer";

export const selectCategories = (state: AppState) => state.sources;

export const selectAllCategories = createSelector(
  selectCategories,
  (state: SourceState) => state.sources
)

export const selectAllActiveSources = createSelector(
  selectCategories,
  (state: SourceState) => state.sources.filter(s => s.isActive)
)

export const savingStatus = createSelector(
  selectCategories,
  (state: SourceState) => state.savingStatus
)
