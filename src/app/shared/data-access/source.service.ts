import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { SourceResponseModel } from '../model/source-response.model';
import { SourceRequestModel } from '../model/source-request.model';

@Injectable({
  providedIn: 'root',
})
export class SourceService {
  private http = inject(HttpClient);
  private baseUrl = environment.API_BASE_URL + 'api/Sources';

  getSources(): Observable<SourceResponseModel[]> {
    return this.http.get<SourceResponseModel[]>(this.baseUrl);
  }

  create(data: SourceRequestModel) {
    return this.http.post<SourceResponseModel>(`${this.baseUrl}`, data);
  }

  update(data: SourceRequestModel) {
    return this.http.put<SourceResponseModel>(`${this.baseUrl}/${data.id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`)
  }
}
