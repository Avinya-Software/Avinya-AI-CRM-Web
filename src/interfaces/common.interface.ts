export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PagedResponse<T> {
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  data: T[];
}
