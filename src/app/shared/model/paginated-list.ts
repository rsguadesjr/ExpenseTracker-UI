export interface PaginatedList<T> {
    currentPage?: number;
    totalRows: number;
    data: T[];
}