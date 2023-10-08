import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfigSettings } from 'src/app/shared/model/app-config-settings';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  private http = inject(HttpClient);
  private baseUrl = environment.API_BASE_URL + 'api/configurations';

  getConfigurations(): Observable<AppConfigSettings> {
    return this.http.get<AppConfigSettings>(this.baseUrl);
  }
}
