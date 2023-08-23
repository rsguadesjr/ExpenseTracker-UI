import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Option } from '../model/option.model';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CategoryResponseModel } from '../model/category-response.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  baseUrl: string;
  private categories$ = new BehaviorSubject<CategoryResponseModel[]>([]);

  constructor(private http: HttpClient) {
    this.baseUrl = environment.API_BASE_URL + 'api/Categories';
  }

  initCategories() {
    this.http.get<CategoryResponseModel[]>(this.baseUrl).subscribe({
      next: (result) => this.categories$.next(result),
    });
  }

  getCategories(): Observable<CategoryResponseModel[]> {
    return this.http.get<CategoryResponseModel[]>(this.baseUrl);
  }

  create(data: any) {
    return this.http.post<any>(`${this.baseUrl}`, data);
              // .pipe(
              //   tap(result => {
              //     this.categories$.next([result, ...this.categories$.value]);
              //   })
              // );
  }

  update(data: any) {
    return this.http.put<any>(`${this.baseUrl}/${data.id}`, data);
              // .pipe(
              //   tap(result => {
              //     const current = this.categories$.value;
              //     const index = this.categories$.value.findIndex(x => x.id == data.id);
              //     current[index] = result;
              //     this.categories$.next([...current]);
              //   })
              // );
  }


  delete(id: any) {
    return this.http.delete(`${this.baseUrl}/${id}`)
  }
}
