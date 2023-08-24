import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Option } from '../model/option.model';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { SourceResponseModel } from '../model/source-response.model';

@Injectable({
  providedIn: 'root',
})
export class SourceService {
  private http = inject(HttpClient);
  private baseUrl = environment.API_BASE_URL + 'api/Sources';

  getSources(): Observable<SourceResponseModel[]> {
    return this.http.get<SourceResponseModel[]>(this.baseUrl);
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
