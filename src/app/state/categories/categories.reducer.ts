import { createReducer, on } from "@ngrx/store";
import { addCategory, addCategoryError, addCategorySuccess, deleteCategory, deleteCategoryError, deleteCategorySuccess, loadCategories, loadCategoriesError, loadCategoriesSuccess, updateCategory, updateCategoryError, updateCategorySuccess } from "./categories.action";
import { CategoryResponseModel } from "src/app/shared/model/category-response.model";

export interface CategoryState {
  categories: CategoryResponseModel[];
  selectedCategory: CategoryResponseModel | null;
  error: string | null;
  loadingStatus: 'pending' | 'loading' | 'error' | 'success';
  savingStatus: 'pending' |'in-progress' | 'error' | 'success';
}


export const initialState: CategoryState = {
  categories: [],
  selectedCategory: null,
  error: null,
  loadingStatus: 'pending',
  savingStatus: 'pending'
}


export const categoryReducer = createReducer(
  initialState,

  /* #region Add Operation */
  on(addCategory, (state, { data } ) => ({
    ...state,
    savingStatus: 'in-progress' as const
  })),

  on(addCategorySuccess, (state, { data }) => ({
    ...state,
    categories: [data, ...state.categories],
    selectedCategory: data,
    savingStatus: 'success' as const
  })),

  on(addCategoryError, (state, { error }) => ({
    ...state,
    error,
    savingStatus: 'error' as const
  })),
  /* #endregion */


  /* #region Update Operation */
  on(updateCategory, (state, { data }) => ({
    ...state,
    savingStatus: 'in-progress' as const
  })),

  on(updateCategorySuccess, (state, { data }) => {
    const categories = [...state.categories];
    const index = categories.findIndex(x => x.id == data.id);
    if (index != -1)
      categories[index] = data;

    return { ...state, categories, selectedCategory: data, savingStatus: 'success' as const };
  }),

  on(updateCategoryError, (state, { error }) => ({
    ...state,
    error,
    savingStatus: 'error' as const
  })),
  /* #endregion */


  /* #region Delete Operation */
  on(deleteCategory, (state, { id }) => ({
    ...state,
    savingStatus: 'in-progress' as const
  })),

  on(deleteCategorySuccess, (state, { id }) => ({
    ...state,
    categories: state.categories.filter(x => x.id !== id),
    savingStatus: 'success' as const
  })),

  on(deleteCategoryError, (state, { error }) => ({
    ...state,
    error,
    savingStatus: 'error' as const
  })),
  /* #endregion*/


  /* #region Load Operation */
  on(loadCategories, (state) => ({
    ...state,
    loadingStatus: 'pending' as const
  })),

  on(loadCategoriesSuccess, (state, { data }) => ({
    ...state,
    categories: data,
    error: null,
    loadingStatus: 'success' as const
  })),

  on(loadCategoriesError, (state, { error }) => ({
    ...state,
    error,
    loadingStatus: 'error' as const
  }))
  /* #endregion*/

)
