import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ReminderModel } from '../../shared/model/reminder-model';
import { ResponseData } from '../model/response-data';
import { ReminderType } from 'src/app/shared/enums/reminder-type';
import { add, differenceInCalendarDays, differenceInDays, differenceInMonths, differenceInWeeks, differenceInYears, parseISO } from 'date-fns';
import parse from 'date-fns/esm/parse';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private baseUrl: string;

  private reminderData$ = new BehaviorSubject<ResponseData<ReminderModel[]>>({
    status: 'SUCCESS',
    data: []
  });
  private previousParam?: string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.API_BASE_URL + 'api/reminders';
  }

  initReminders(startDate: string, endDate: string) {
    if (this.previousParam == JSON.stringify({ startDate, endDate })) {
      this.reminderData$.next({ status: 'SUCCESS', data: this.reminderData$.value?.data || []})
    }
    else {
      this.reminderData$.next({ status: 'LOADING', data: [...this.reminderData$.value?.data]})
      this.http.get<ReminderModel[]>(`${this.baseUrl}`, { params: { startDate: startDate || '', endDate: endDate || ''}})
        .pipe(
          tap(() => {
            this.reminderData$.next({ status: 'LOADING', data: []})
          })
        )
        .subscribe({
          next: (result) => {
            const processedData = this.process(result, endDate);
            this.reminderData$.next({ status: 'SUCCESS', data: processedData });
          },
          error: (error) => {
            this.reminderData$.next({ status: 'ERROR', data: []})
          }
        })
    }
  }

  getReminderData(): Observable<ResponseData<ReminderModel[]>> {
    return this.reminderData$
  }


  private process(reminders: ReminderModel[], endDate: string): ReminderModel[] {
    const _data: ReminderModel[] = [];
    const _endDate = new Date(endDate);

    // one time reminders
    const oneTimeReminders = reminders.filter(x => x.type == ReminderType.OneTime);
    _data.push(...oneTimeReminders.map(x => ({...x, date: parseISO(x.startDate) })));


    const recurringReminders = reminders.filter(x => x.type != ReminderType.OneTime);
    for (let reminder of recurringReminders) {
      const _currentReminderStartDate = new Date(reminder.startDate);
      let dateDiff: number = 0;
      let key: string;

      if (reminder.type == ReminderType.Daily) {
        dateDiff = differenceInDays(_currentReminderStartDate, _endDate);
        key = 'day'
      }
      else if (reminder.type == ReminderType.Weekly) {
        dateDiff = differenceInWeeks(_currentReminderStartDate, _endDate);
        key = 'weeks'
      }
      else if (reminder.type == ReminderType.Monthly) {
        dateDiff = differenceInMonths(_currentReminderStartDate, _endDate);
        key = 'months'
      }
      else if (reminder.type == ReminderType.Yearly) {
        dateDiff = differenceInYears(_currentReminderStartDate, _endDate);
        key = 'years'
      }

      for(let i=0; i < (Math.abs(dateDiff) + 1); i++ ) {
        let duration: any = {};
        duration[key!] = i;
        const _newDate = add(_currentReminderStartDate, duration );
        _data.push(Object.assign({}, {...reminder, date: _newDate }));
      }
    }

    return _data;
  }

//   private processDailyReminders(reminders: ReminderModel[], endDate: string): ReminderModel[] {
//     const _data: ReminderModel[] = [];
//     const _endDate = new Date(endDate);

//     for(let dr of reminders) {
//       const _currentReminderStartDate = new Date(dr.startDate);
//       const _diffDays = differenceInDays(_currentReminderStartDate, _endDate);

//       const test = new Array(_diffDays).map((_, i) => {
//         const _newDate = add(_currentReminderStartDate, { days: i });
//         return { ...dr, date: _newDate };
//       })
//     }

//     return _data;
//   }

//   private processWeeklyReminders(reminders: ReminderModel[], endDate: string): ReminderModel[] {
//     const _data: ReminderModel[] = [];
//     const _endDate = new Date(endDate);

//     for(let dr of reminders) {
//       const _currentReminderStartDate = new Date(dr.startDate);
//       const _diffDays = differenceInWeeks(_currentReminderStartDate, _endDate);

//       const test = new Array(_diffDays).map((_, i) => {
//         const _newDate = add(_currentReminderStartDate, { weeks: i });
//         return { ...dr, date: _newDate };
//       })
//     }

//     return _data;
//   }

//   private processMonthlyReminders(reminders: ReminderModel[], endDate: string): ReminderModel[] {
//     const _data: ReminderModel[] = [];
//     const _endDate = new Date(endDate);

//     for(let dr of reminders) {
//       const _currentReminderStartDate = new Date(dr.startDate);
//       const _diffDays = differenceInMonths(_currentReminderStartDate, _endDate);

//       const test = new Array(_diffDays).map((_, i) => {
//         const _newDate = add(_currentReminderStartDate, { months: i });
//         return { ...dr, date: _newDate };
//       })
//     }

//     return _data;
//   }

//   private processYearlyReminders(reminders: ReminderModel[], endDate: string): ReminderModel[] {
//     const _data: ReminderModel[] = [];
//     const _endDate = new Date(endDate);

//     for(let dr of reminders) {
//       const _currentReminderStartDate = new Date(dr.startDate);
//       const _diffDays = differenceInYears(_currentReminderStartDate, _endDate);

//       const test = new Array(_diffDays).map((_, i) => {
//         const _newDate = add(_currentReminderStartDate, { days: i });
//         return { ...dr, date: _newDate };
//       })
//     }

//     return _data;
//   }
}
