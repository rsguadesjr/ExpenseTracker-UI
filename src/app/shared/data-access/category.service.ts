import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Option } from '../model/option.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  baseUrl: string;
  private categories$ = new BehaviorSubject<Option[]>([]);

  constructor(private http: HttpClient) {
    this.baseUrl = environment.API_BASE_URL + 'api/Categories';
  }

  initCategories() {
    this.http.get<Option[]>(this.baseUrl).subscribe({
      next: (result) => this.categories$.next(result),
    });
  }

  getCategories(): Observable<Option[]> {
    return this.categories$;
  }
}
