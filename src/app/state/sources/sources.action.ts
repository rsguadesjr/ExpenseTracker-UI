import { createAction, props } from "@ngrx/store";
import { SourceRequestModel } from "src/app/shared/model/source-request.model";
import { SourceResponseModel } from "src/app/shared/model/source-response.model";

/* #region Add Operation */
export const addSource = createAction(
  '[Source Page] Add Source',
  props<{ data: SourceRequestModel }>()
)
export const addSourceSuccess = createAction(
  '[Source API] Add Source Success',
  props<{ data: SourceResponseModel }>()
)
export const addSourceError = createAction(
  '[Source API] Add Source Error',
  props<{ error: string }>()
)
/* #endregion */


/* #region Update Operation */
export const updateSource = createAction(
  '[Source Page] Update Source',
  props<{ data: SourceRequestModel }>()
)
export const updateSourceSuccess = createAction(
  '[Source API] Update Source Success',
  props<{ data: SourceResponseModel }>()
)
export const updateSourceError = createAction(
  '[Source API] Update Source Error',
  props<{ error: string }>()
)
/* #endregion */


/* #region Delete Operation */
export const deleteSource = createAction(
  '[Source Page] Delete Source',
  props<{ id: number }>()
)
export const deleteSourceSuccess = createAction(
  '[Source API] Delete Source Success',
  props<{ id: number }>()
)
export const deleteSourceError = createAction(
  '[Source API] Delete Source Error',
  props<{ error: string }>()
)
/* #endregion */


/* #region Load Operation */
export const loadSources = createAction(
  '[Source Page] Load Sources'
)


export const loadSourcesSuccess = createAction(
  '[Source API] Load Sources Success',
  props<{ data: SourceResponseModel[] }>()
)
export const loadSourcesError = createAction(
  '[Source API] Load Sources Error',
  props<{ error: string }>()
)
/* #endregion */
