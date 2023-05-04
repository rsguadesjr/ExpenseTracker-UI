import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Option } from '../model/option.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SourceService {
  baseUrl: string;
  private sources$ = new BehaviorSubject<Option[]>([]);

  constructor(private http: HttpClient) {
    this.baseUrl = environment.API_BASE_URL + 'api/Sources';
  }

  initSources() {
    this.http.get<Option[]>(this.baseUrl).subscribe({
      next: (result) => this.sources$.next(result),
    });
  }

  getSources(): Observable<Option[]> {
    return this.sources$;
  }
}
