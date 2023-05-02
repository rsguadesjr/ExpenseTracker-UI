export interface ResponseData<T> {
  status: 'LOADING' | 'SUCCESS' | 'ERROR',
  data: T,
  errorMessage?: string
}
