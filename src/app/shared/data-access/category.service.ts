import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Option } from '../model/option.model';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CategoryResponseModel } from '../model/category-response.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private baseUrl = environment.API_BASE_URL + 'api/Categories';

  getCategories(): Observable<CategoryResponseModel[]> {
    return this.http.get<CategoryResponseModel[]>(this.baseUrl);
  }

  create(data: any) {
    return this.http.post<any>(`${this.baseUrl}`, data);
  }

  update(data: any) {
    return this.http.put<any>(`${this.baseUrl}/${data.id}`, data);
  }

  delete(id: any) {
    return this.http.delete(`${this.baseUrl}/${id}`)
  }
}
