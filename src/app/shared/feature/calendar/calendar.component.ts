import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  startOfMonth,
} from 'date-fns';
import { CalendarItem } from '../../model/calendar-item';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, CalendarModule, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent {
  @Input() date: Date = new Date();
  @Input() month: Date = new Date();

  calendarData?: any = {};
  @Input() set items(calendarItems: CalendarItem[]) {
    this.calendarData = {};
    if (calendarItems && calendarItems.length > 0) {
      const dates = eachDayOfInterval({
        start: startOfMonth(this.month),
        end: endOfMonth(this.month),
      });
      for (let date of dates) {
        const dateKey = `${format(date, 'Md')}`;
        const dateItems: any[] = [];

        for (let ci of calendarItems) {
          const item = ci.items.find((x) => isSameDay(x.date, date));
          if (item) {
            dateItems.push({ ...item, dateKey: format(item?.date, 'Md') });
          }
        }

        this.calendarData[dateKey] = dateItems;
      }
    }
  }

  @Output() selectDate = new EventEmitter<Date>();
  @Output() monthChange = new EventEmitter<{ year: number; month: number }>();

  onSelectDate(e: any) {
    this.selectDate.emit(this.date);
  }

  onMonthChange({ year, month }: { year: number; month: number }) {
    this.month = new Date(year, month - 1);
    this.monthChange.emit({ year, month: month - 1 });
  }
}
