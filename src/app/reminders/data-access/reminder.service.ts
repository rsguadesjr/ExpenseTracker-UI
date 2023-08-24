import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject, catchError, map, of, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ReminderModel } from '../../shared/model/reminder-model';
import { ReminderType } from 'src/app/shared/enums/reminder-type';
import { add, differenceInCalendarDays, differenceInDays, differenceInMonths, differenceInWeeks, differenceInYears, endOfMonth, parseISO, startOfMonth } from 'date-fns';
import parse from 'date-fns/esm/parse';
import { ReminderRequestModel } from 'src/app/shared/model/reminder-request.model';
import { ResponseData } from 'src/app/shared/model/response-data';

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
