import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Option } from '../model/option.model';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { SourceResponseModel } from '../model/source-response.model';

@Injectable({
  providedIn: 'root',
})
export class SourceService {
  baseUrl: string;
  private sources$ = new BehaviorSubject<SourceResponseModel[]>([]);

  constructor(private http: HttpClient) {
    this.baseUrl = environment.API_BASE_URL + 'api/Sources';
  }

  initSources() {
    this.http.get<SourceResponseModel[]>(this.baseUrl).subscribe({
      next: (result) => this.sources$.next(result),
    });
  }

  getSources(): Observable<SourceResponseModel[]> {
    return this.http.get<SourceResponseModel[]>(this.baseUrl);
  }


  create(data: any) {
    return this.http.post<any>(`${this.baseUrl}`, data);
              // .pipe(
              //   tap(result => {
              //     this.sources$.next([result, ...this.sources$.value]);
              //   })
              // );
  }

  update(data: any) {
    return this.http.put<any>(`${this.baseUrl}/${data.id}`, data)
              // .pipe(
              //   tap(result => {
              //     const current = this.sources$.value;
              //     const index = this.sources$.value.findIndex(x => x.id == data.id);
              //     current[index] = result;
              //     this.sources$.next([...current]);
              //   })
              // );
  }

  delete(id: any) {
    return this.http.delete(`${this.baseUrl}/${id}`)
  }
}
