import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { eachDayOfInterval, isSameDay, format, startOfMonth, endOfMonth } from 'date-fns';
import { ReminderModel } from '../../model/reminder-model';
import { TotalPerDate } from '../../model/total-per-date';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-calendar-data',
  standalone: true,
  imports: [
    CommonModule,
    CalendarModule,
    FormsModule,
    DecimalPipe,
    ButtonModule,
  ],
  providers: [DecimalPipe],
  templateUrl: './calendar-data.component.html',
  styleUrls: ['./calendar-data.component.scss']
})
export class CalendarDataComponent {
  selectedReminders: ReminderModel[] = [];
  calendarData?: any = {};
  calendarDate = new Date();
  dailySummary?: any = {};

  private _reminders: ReminderModel[] = [];
  @Input() set reminders(value: ReminderModel[]) {
    this._reminders = value;
    console.log('[DEBUG] CalendarDataComponent reminders', value);
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

  @Input() set dailyTotalSummary(value: TotalPerDate[]) {
    console.log('[DEBUg] CalendarDataComponent dailyTotalSummary', value);
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


  @Output("applySelectedDate")applySelectedDateChange = new EventEmitter<Date>();
  @Output() monthChange = new EventEmitter<{ year: number, month: number}>();

  constructor(public decimalPipe: DecimalPipe) {}

  onMonthChange(e: { year: number, month: number}) {
    console.log('[DEBUG] onMonthChange', e);
    this.monthChange.emit(e);
  }

  onSelectDate(date: Date) {
    this.selectedReminders = this.reminders.filter((x) =>
      isSameDay(x.date, date)
    );
  }

  selectReminder(reminder: ReminderModel) {
    console.log('[DEBUG] selectReminder', reminder);
  }

  newReminder() {
    console.log('[DEBUG] newReminder');
  }

  applySelectedDate() {
    if (this.calendarDate) {
      console.log('[DEBUG] selectDate', this.calendarDate);
      this.applySelectedDateChange.emit(this.calendarDate);
    }
  }
}
