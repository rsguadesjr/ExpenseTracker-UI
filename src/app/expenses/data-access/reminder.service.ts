import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ReminderModel } from '../../shared/model/reminder-model';
import { ResponseData } from '../model/response-data';
import { ReminderType } from 'src/app/shared/enums/reminder-type';
import { add, differenceInCalendarDays, differenceInDays, differenceInMonths, differenceInWeeks, differenceInYears, parseISO } from 'date-fns';
import parse from 'date-fns/esm/parse';
import { ReminderRequestModel } from 'src/app/shared/model/reminder-request-model';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private baseUrl: string;

  private reminderData$ = new BehaviorSubject<ResponseData<ReminderModel[]>>({
    status: 'SUCCESS',
    data: []
  });
  private cache = new Map();
  private currentParams?: { startDate: string, endDate: string };

  constructor(private http: HttpClient) {
    this.baseUrl = environment.API_BASE_URL + 'api/reminders';
  }

  fetchReminders(startDate: string, endDate: string) {
    this.currentParams = { startDate, endDate };
    // cache key will be the start date and end date - this will be checked if the same parameter is being used so
    // the cached value will be returned instead of repetitive api requests
    const cacheKey = `${startDate}-${endDate}`;

    // if already exists in the cache, return the cached value else request from api
    if (this.cache.has(cacheKey)) {
      const value = this.cache.get(cacheKey) as ReminderModel[];
      this.reminderData$.next({ status: 'SUCCESS', data: value || []})
    }
    else {
      this.reminderData$.next({ status: 'LOADING', data: [...this.reminderData$.value?.data]})
      this.http.get<ReminderModel[]>(`${this.baseUrl}`, { params: { startDate: startDate || '', endDate: endDate || ''}})
        .pipe()
        .subscribe({
          next: (result) => {
            // process the result, this will handle recurring reminders and will create multiple data base on the recurring type
            const processedData = this.process(result, endDate);
            // store the data in cache so if the same request just return the cached value
            this.cache.set(cacheKey, processedData);
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


  createReminder(data: ReminderRequestModel) {
    this.reminderData$.next({ status: 'LOADING', data: this.reminderData$.value.data});
    return this.http.post<ReminderModel>(`${this.baseUrl}`, data)
              .pipe(
                tap(result => {
                  const processData = this.process([result], this.currentParams?.endDate ?? new Date().toISOString());
                  const updatedData =  [...processData, ...this.reminderData$.value.data];
                  this.reminderData$.next({ status: 'SUCCESS', data: updatedData });
                })
              );
  }

  updateReminder(id: number, data: ReminderRequestModel) {
    this.reminderData$.next({ status: 'LOADING', data: this.reminderData$.value.data});
    return this.http.put<ReminderModel>(`${this.baseUrl}/${id}`, data)
              .pipe(
                tap(result => {
                  const processData = this.process([result], this.currentParams?.endDate ?? new Date().toISOString());
                  const filteredCurrentData = this.reminderData$.value.data.filter(x => x.id != id);
                  const updatedData =  [...processData, ...filteredCurrentData];
                  this.reminderData$.next({ status: 'SUCCESS', data: updatedData });
                })
              );
  }

  deleteReminder(id: number) {
    // track deleted entry
    const deleted = this.reminderData$.value.data.find(x => x.id === id);

    // update current list
    const updatedData =  [...this.reminderData$.value.data.filter(x => x.id !== id)];
    this.reminderData$.next({ status: 'LOADING', data: updatedData});

    return this.http.delete(`${this.baseUrl}/${id}`)
                .pipe(
                  tap(() => {
                    // update status only
                    this.reminderData$.next({ status: 'SUCCESS', data: updatedData });
                  }),
                  catchError((error) => {
                    // if error, add back the deleted entry
                    if (deleted) {
                      this.reminderData$.next({ status: 'ERROR', data: [deleted, ...updatedData] });
                    }

                    return throwError(() => error);
                  })
                );
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
      const _currentReminderEndDate = reminder.endDate ? new Date(reminder.endDate) : _endDate;
      let dateDiff: number = 0;
      let key: string;

      if (reminder.type == ReminderType.Daily) {
        dateDiff = differenceInDays(_currentReminderStartDate, _currentReminderEndDate);
        key = 'days'
      }
      else if (reminder.type == ReminderType.Weekly) {
        dateDiff = differenceInWeeks(_currentReminderStartDate, _currentReminderEndDate);
        key = 'weeks'
      }
      else if (reminder.type == ReminderType.Monthly) {
        dateDiff = differenceInMonths(_currentReminderStartDate, _currentReminderEndDate);
        key = 'months'
      }
      else if (reminder.type == ReminderType.Yearly) {
        dateDiff = differenceInYears(_currentReminderStartDate, _currentReminderEndDate);
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
