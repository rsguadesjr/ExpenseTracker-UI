import { createReducer, on } from "@ngrx/store";
import { addSource, addSourceError, addSourceSuccess, deleteSource, deleteSourceError, deleteSourceSuccess, loadSources, loadSourcesError, loadSourcesSuccess, updateSource, updateSourceError, updateSourceSuccess } from "./sources.action";

export interface SourceState {
  sources: any[];
  selectedSource: any;
  error: string | null;
  loadingStatus: 'pending' | 'loading' | 'error' | 'success';
  savingStatus: 'pending' |'in-progress' | 'error' | 'success';
}


export const initialState: SourceState = {
  sources: [],
  selectedSource: null,
  error: null,
  loadingStatus: 'pending',
  savingStatus: 'pending'
}


export const sourceReducer = createReducer(
  initialState,

  /* #region Add Operation */
  on(addSource, (state, { data } ) => ({
    ...state,
    savingStatus: 'in-progress' as const
  })),

  on(addSourceSuccess, (state, { data }) => ({
    ...state,
    sources: [data, ...state.sources],
    selectedSource: data,
    savingStatus: 'success' as const
  })),

  on(addSourceError, (state, { error }) => ({
    ...state,
    error,
    savingStatus: 'error' as const
  })),
  /* #endregion */


  /* #region Update Operation */
  on(updateSource, (state, { data }) => ({
    ...state,
    savingStatus: 'in-progress' as const
  })),

  on(updateSourceSuccess, (state, { data }) => {
    const sources = [...state.sources];
    const index = sources.findIndex(x => x.id == data.id);
    if (index != -1)
      sources[index] = data;

    return { ...state, sources, selectedSource: data, savingStatus: 'success' as const };
  }),

  on(updateSourceError, (state, { error }) => ({
    ...state,
    error,
    savingStatus: 'error' as const
  })),
  /* #endregion */


  /* #region Delete Operation */
  on(deleteSource, (state, { id }) => ({
    ...state,
    savingStatus: 'in-progress' as const
  })),

  on(deleteSourceSuccess, (state, { id }) => ({
    ...state,
    sources: state.sources.filter(x => x.id !== id),
    savingStatus: 'success' as const
  })),

  on(deleteSourceError, (state, { error }) => ({
    ...state,
    error,
    savingStatus: 'error' as const
  })),
  /* #endregion*/


  /* #region Load Operation */
  on(loadSources, (state) => ({
    ...state,
    loadingStatus: 'pending' as const
  })),

  on(loadSourcesSuccess, (state, { data }) => ({
    ...state,
    sources: data,
    error: null,
    loadingStatus: 'success' as const
  })),

  on(loadSourcesError, (state, { error }) => ({
    ...state,
    error,
    loadingStatus: 'error' as const
  }))
  /* #endregion*/

)
