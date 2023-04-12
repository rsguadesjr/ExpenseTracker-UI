import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Option } from '../model/option.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SourceService {
  baseUrl: string;


  constructor(private http: HttpClient) {
    this.baseUrl = environment.API_BASE_URL + 'api/Sources';
  }

  getSources() {
    return this.http.get<Option[]>(this.baseUrl);
  }
}
