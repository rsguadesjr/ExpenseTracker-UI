import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Option } from '../model/option.model';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CategoryResponseModel } from '../model/category-response.model';
import { CategoryRequestModel } from '../model/category-request.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private baseUrl = environment.API_BASE_URL + 'api/Categories';

  getCategories(): Observable<CategoryResponseModel[]> {
    return this.http.get<CategoryResponseModel[]>(this.baseUrl);
  }

  create(data: CategoryRequestModel) {
    return this.http.post<CategoryResponseModel>(`${this.baseUrl}`, data);
  }

  update(data: CategoryRequestModel) {
    return this.http.put<CategoryResponseModel>(`${this.baseUrl}/${data.id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`)
  }
}
