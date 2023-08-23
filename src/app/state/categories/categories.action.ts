import { createAction, props } from "@ngrx/store";

/* #region Add Operation */
export const addCategory = createAction(
  '[Category Page] Add Category',
  props<{ data: any }>()
)
export const addCategorySuccess = createAction(
  '[Category API] Add Category Success',
  props<{ data: any }>()
)
export const addCategoryError = createAction(
  '[Category API] Add Category Error',
  props<{ error: string }>()
)
/* #endregion */


/* #region Update Operation */
export const updateCategory = createAction(
  '[Category Page] Update Category',
  props<{ data: any }>()
)
export const updateCategorySuccess = createAction(
  '[Category API] Update Category Success',
  props<{ data: any }>()
)
export const updateCategoryError = createAction(
  '[Category API] Update Category Error',
  props<{ error: string }>()
)
/* #endregion */


/* #region Delete Operation */
export const deleteCategory = createAction(
  '[Category Page] Delete Category',
  props<{ id: number }>()
)
export const deleteCategorySuccess = createAction(
  '[Category API] Delete Category Success',
  props<{ id: number }>()
)
export const deleteCategoryError = createAction(
  '[Category API] Delete Category Error',
  props<{ error: string }>()
)
/* #endregion */


/* #region Load Operation */
export const loadCategories = createAction(
  '[Category Page] Load Categories'
)

export const loadCategoriesSuccess = createAction(
  '[Category API] Load Categories Success',
  props<{ data: any }>()
)
export const loadCategoriesError = createAction(
  '[Category API] Load Categories Error',
  props<{ error: string }>()
)
/* #endregion */
