import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ReminderModel } from '../../shared/model/reminder-model';
import { ReminderRequestModel } from 'src/app/shared/model/reminder-request.model';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private http = inject(HttpClient);
  private baseUrl = environment.API_BASE_URL + 'api/reminders';

  getReminders(startDate: string, endDate: string) {
    return  this.http.get<ReminderModel[]>(`${this.baseUrl}`, { params: { startDate: startDate || '', endDate: endDate || ''}});
  }

  createReminder(data: ReminderRequestModel) {
    return this.http.post<ReminderModel>(`${this.baseUrl}`, data);
  }

  updateReminder(id: number, data: ReminderRequestModel) {
    return this.http.put<ReminderModel>(`${this.baseUrl}/${id}`, data);
  }

  deleteReminder(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
