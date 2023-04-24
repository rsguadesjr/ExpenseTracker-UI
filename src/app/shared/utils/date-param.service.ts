import { Injectable } from '@angular/core';
import add from 'date-fns/add';
import endOfDay from 'date-fns/endOfDay';
import endOfMonth from 'date-fns/endOfMonth';
import endOfWeek from 'date-fns/endOfWeek';
import endOfYear from 'date-fns/endOfYear';
import format from 'date-fns/format';
import startOfDay from 'date-fns/startOfDay';
import startOfMonth from 'date-fns/startOfMonth';
import startOfWeek from 'date-fns/startOfWeek';
import startOfYear from 'date-fns/startOfYear';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DateParamService {
  constructor() {}

  // TODO: add option to override formatting
  getDateRange(view: 'week' | 'month' | 'year' | 'day') {
    let startDate;
    let endDate;
    let displayText;
    let date = new Date();
    switch (view) {
      case 'week':
        date =
          new Date().getDay() == 0 ? add(new Date(), { days: -1 }) : new Date();
        startDate = add(startOfWeek(date), { days: 1 });
        endDate = add(endOfWeek(date), { days: 1 });
        displayText = `${format(startDate, 'MMMM dd')} - ${format(
          endDate,
          'MMMM dd'
        )}`;
        break;
      case 'month':
        startDate = startOfMonth(date);
        endDate = endOfMonth(date);

        displayText = `Month of ${format(date, 'MMMM')}`;
        break;
      case 'year':
        startDate = startOfYear(date);
        endDate = endOfYear(date);

        displayText = `Year ${format(date, 'yyyy')}`;
        break;
      case 'day':
      default:
        startDate = startOfDay(date);
        endDate = endOfDay(date);
        displayText = `${format(date, 'MMMM dd')}`;
        break;
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      displayText,
    };
  }
}
