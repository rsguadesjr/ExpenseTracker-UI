import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Option } from '../model/option.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.API_BASE_URL + 'api/Categories';
  }

  getCategories() {
    return this.http.get<Option[]>(this.baseUrl);
  }
}
