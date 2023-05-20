import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ReminderModel } from '../../model/reminder-model';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  startOfMonth,
} from 'date-fns';
import { ButtonModule } from 'primeng/button';
import { TotalPerDate } from '../../model/total-per-date';

@Component({
  selector: 'app-reminder-calendar',
  standalone: true,
  imports: [
    CommonModule,
    CalendarModule,
    FormsModule,
    DecimalPipe,
    ButtonModule,
  ],
  providers: [DecimalPipe],
  templateUrl: './reminder-calendar.component.html',
  styleUrls: ['./reminder-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReminderCalendarComponent {
  selectedReminders: ReminderModel[] = [];
  calendarData?: any = {};
  calendarDate = new Date();
  dailySummary?: any = {};

  private _reminders: ReminderModel[] = [];
  @Input() set reminders(value: ReminderModel[]) {
    this._reminders = value;
    if (this._reminders) {
      const dates = eachDayOfInterval({ start: this.startDate, end: this.endDate });
      this.calendarData = {};
      for (let date of dates) {
        const reminders = value.filter((x) => isSameDay(x.date, date));
        this.calendarData[`${format(date, 'yyyy-MM-dd')}`] = reminders.length;
      }

      this.selectedReminders = value.filter((x) =>
        isSameDay(x.date, this.calendarDate)
      )
    }
  }

  get reminders() {
    return this._reminders;
  }

  @Input() set dailyTotal(value: TotalPerDate[]) {
    if (value) {
      const dates = eachDayOfInterval({ start: this.startDate, end: this.endDate });
      this.dailySummary = {};
      for (const date of dates) {
        const sum = value
                  .filter((x) => isSameDay(date, new Date(x.expenseDate)))
                  .reduce((acc, obj) => acc + obj.total, 0);
        this.dailySummary[format(date, 'yyyy-MM-dd')] = sum || '';
      }
    }
  }


  /**
   * Date Range
   */
  private _startDate?: Date;
  @Input() set startDate(value: Date) {
    this._startDate = value;
  }
  get startDate() {
    return this._startDate ?? startOfMonth(new Date());
  }

  private _endDate?: Date;
  @Input() set endDate(value: Date) {
    this._endDate = value;
  }
  get endDate() {
    return this._endDate ?? endOfMonth(new Date());
  }


  constructor(public decimalPipe: DecimalPipe) {}

  onMonthChange(e: any) {
  }

  onSelectedDate(date: Date) {
    this.selectedReminders = this.reminders.filter((x) =>
      isSameDay(x.date, date)
    );
  }

  selectReminder(reminder: ReminderModel) {
  }

  newReminder() {
  }
}
