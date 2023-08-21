import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, catchError, map, of, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ReminderModel } from '../../shared/model/reminder-model';
import { ReminderType } from 'src/app/shared/enums/reminder-type';
import { add, differenceInCalendarDays, differenceInDays, differenceInMonths, differenceInWeeks, differenceInYears, endOfMonth, parseISO, startOfMonth } from 'date-fns';
import parse from 'date-fns/esm/parse';
import { ReminderRequestModel } from 'src/app/shared/model/reminder-request-model';
import { ResponseData } from 'src/app/shared/model/response-data';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private baseUrl: string;

  private currentParams?: { startDate: string, endDate: string } = {
    startDate: startOfMonth(new Date()).toISOString(),
    endDate: endOfMonth(new Date()).toISOString()
  };

  private reminderData$ = new BehaviorSubject<ResponseData<ReminderModel[]>>({
    status: 'SUCCESS',
    data: [],
    params: this.currentParams
  });

  private processState = new BehaviorSubject<'LOADING' | 'SUCCESS' | 'ERROR'>('SUCCESS');

  private deletedId$ = new Subject<number>();
  private latestData$ = new Subject<ReminderModel>();

  private cache = new Map();

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
      this.reminderData$.next({ data: value || [], params: this.currentParams })
    }
    else {
      this.http.get<ReminderModel[]>(`${this.baseUrl}`, { params: { startDate: startDate || '', endDate: endDate || ''}})
        .pipe()
        .subscribe({
          next: (result) => {
            // store the data in cache so if the same request just return the cached value
            this.cache.set(cacheKey, result);
            this.reminderData$.next({ data: result, params: this.currentParams });
            this.processState.next('SUCCESS');
          },
          error: (error) => {
            this.reminderData$.next({ data: [], params: this.currentParams})
            this.processState.next('ERROR');
          }
        })
    }
  }


  getReminders(startDate: string, endDate: string) {
    return  this.http.get<ReminderModel[]>(`${this.baseUrl}`, { params: { startDate: startDate || '', endDate: endDate || ''}});
  }

  /**
   *
   * @returns the processed data that will be used in a calendar
   */
  getTansformedData(): Observable<ResponseData<ReminderModel[]>> {
    return this.reminderData$.pipe(
      map(result => {
        if (result?.data?.length > 0) {
          // process the result, this will handle recurring reminders and will create multiple data base on the recurring type
          const uniqueEntries = this.getUniqueEntries(result.data);
          const processedData = this.process(uniqueEntries,  result.params);
          return { ...result, data: processedData };
        }

        return result;
      })
    )
  }


  /**
   *
   * @returns the data directly from api and will be used in a datatable
   */
  getData() {
    return this.reminderData$.asObservable();
  }

  /**
   * @returns the item that was just created or updated
   */
  getCreatedOrUpdatedItem() {
    return this.latestData$.asObservable().pipe(
      map(result => {
        return this.process([result], this.reminderData$.value.params)
                    .sort((a, b) => a.date > b.date ? 1 : (a.date < b.date ? -1 : 0));
      })
    )
  }

  /**
   *
   * @returns the id of the deleted item
   */
  getDeletedId() {
    return this.deletedId$.asObservable();
  }


  /**
   *
   * @returns loading state, LOADING | SUCCESS | ERRROR
   */
  getProcessState() {
    return this.processState.asObservable();
  }


  createReminder(data: ReminderRequestModel) {
    this.processState.next('LOADING');
    return this.http.post<ReminderModel>(`${this.baseUrl}`, data)
              .pipe(
                tap(result => {
                  const processData = this.process([result], this.currentParams!);
                  const updatedData =  [...processData, ...this.reminderData$.value.data];
                  this.reminderData$.next({ data: updatedData, params: this.currentParams });
                  this.latestData$.next(result);
                  this.processState.next('SUCCESS');
                }),
                catchError((error) => {
                  this.processState.next('ERROR');
                  return throwError(() => error);
                })
              );
  }

  updateReminder(id: number, data: ReminderRequestModel) {
    this.processState.next('LOADING');
    return this.http.put<ReminderModel>(`${this.baseUrl}/${id}`, data)
              .pipe(
                tap(result => {
                  const processData = this.process([result], this.currentParams!);
                  const filteredCurrentData = this.reminderData$.value.data.filter(x => x.id != id);
                  const updatedData =  [...processData, ...filteredCurrentData];
                  this.reminderData$.next({ data: updatedData, params: this.currentParams  });
                  this.latestData$.next(result);
                  this.processState.next('SUCCESS');
                }),
                catchError((error) => {
                  this.processState.next('ERROR');
                  return throwError(() => error);
                })
              );
  }

  deleteReminder(id: number) {
    // track deleted entry
    const deleted = this.reminderData$.value.data.find(x => x.id === id);

    // update current list
    const updatedData =  [...this.reminderData$.value.data.filter(x => x.id !== id)];
    return this.http.delete(`${this.baseUrl}/${id}`)
                .pipe(
                  tap(() => {
                    this.reminderData$.next({ data: updatedData, params: this.currentParams });
                    this.deletedId$.next(id);
                    this.processState.next('SUCCESS');
                  }),
                  catchError((error) => {
                    // if error, add back the deleted entry
                    if (deleted) {
                      this.reminderData$.next({ data: [deleted, ...updatedData], params: this.currentParams });
                    }

                    this.processState.next('ERROR');
                    return throwError(() => error);
                  })
                );
  }


  /**
   *
   * @param reminders the reminder data to be transformed
   * @param param1 the date range specified
   * @returns the transformed data, this will create an item for each date occurence
   */
  private process(reminders: ReminderModel[], { startDate, endDate }: { startDate: string, endDate: string}): ReminderModel[] {
    const _data: ReminderModel[] = [];
    const _endDate = new Date(endDate);

    // one time reminders
    const oneTimeReminders = reminders.filter(x => x.type == ReminderType.OneTime);
    _data.push(...oneTimeReminders.map(x => ({...x, date: parseISO(x.startDate) })));


    // recurring reminders
    const recurringReminders = reminders.filter(x => x.type != ReminderType.OneTime);
    for (let reminder of recurringReminders) {

      // determine the start date, startDate should be within the date range
      let rangeStartDate = new Date(startDate);
      let _currentReminderStartDate = new Date(reminder.startDate);
      if (rangeStartDate >= _currentReminderStartDate) {
        let month = rangeStartDate.getMonth();
        let year = rangeStartDate.getFullYear();
        let day = _currentReminderStartDate.getDate();
        _currentReminderStartDate = new Date(year, month, day);
      }

      let _currentReminderEndDate = reminder.endDate ? new Date(reminder.endDate) : _endDate;
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

  /**
   * unprocessed items, will be used to regenerate transformed data
   */
  private getUniqueEntries(data: ReminderModel[]) : ReminderModel[] {
    // distinct the result
    let ids = Array.from(new Set(data.map(x => x.id)));
    let uniqueData = ids.map(id => {
      // get all entries
      const entries = data.filter(x => x.id == id);
      // get one item from the entries
      return entries[0];
    })
    return uniqueData;
  }
}
