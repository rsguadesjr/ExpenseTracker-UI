import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { eachDayOfInterval, isSameDay, format, startOfMonth, endOfMonth } from 'date-fns';
import { ReminderModel } from '../../../shared/model/reminder-model';
import { TotalPerDate } from '../../../shared/model/total-per-date';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ReminderFormComponent } from '../../../reminders/feature/reminder-form/reminder-form.component';
import { take } from 'rxjs';
import { ToastService } from '../../../shared/utils/toast.service';
import { Expense } from 'src/app/expenses/model/expense.model';
import { ExpenseDetailComponent } from 'src/app/expenses/feature/expense-detail/expense-detail.page.component';
import { ExpenseDto } from 'src/app/expenses/model/expense-dto.model';
import { ReminderType } from '../../../shared/enums/reminder-type';
import { TooltipModule } from 'primeng/tooltip';
import { AccessDirective } from '../../../shared/utils/access.directive';
import { ReminderService } from 'src/app/reminders/data-access/reminder.service';

@Component({
  selector: 'app-calendar-data',
  standalone: true,
  imports: [
    CommonModule,
    CalendarModule,
    FormsModule,
    DecimalPipe,
    ButtonModule,
    TooltipModule,
    AccessDirective
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

  constructor(public decimalPipe: DecimalPipe,
              private confirmationService: ConfirmationService,
              private dialogService: DialogService,
              private reminderService: ReminderService,
              private toastService: ToastService) {}

  onMonthChange(e: { year: number, month: number}) {
    this.monthChange.emit(e);
  }

  onSelectDate(date: Date) {
    this.selectedReminders = this.reminders.filter((x) =>
      isSameDay(x.date, date)
    );
  }

  selectReminder(reminder: ReminderModel) {
  }

  applySelectedDate() {
    if (this.calendarDate) {
      this.applySelectedDateChange.emit(this.calendarDate);
    }
  }

  onShow(e: any) {
  }

  newReminder() {
    this.dialogService.open(ReminderFormComponent, {
      width: '540px',
      header: 'Create',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      styleClass: 'component-dialog',
      closeOnEscape: true,
      data: {
        isEdit: false,
        reminder: {
          startDate: this.calendarDate.toISOString(),
          date: this.calendarDate
        } as ReminderModel
      }
    });
  }


  editReminder(reminder: ReminderModel) {
    this.dialogService.open(ReminderFormComponent, {
      width: '540px',
      header: 'Update',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      styleClass: 'component-dialog',
      closeOnEscape: true,
      data: {
        isEdit: true,
        reminder
      }
    });
  }

  removeReminder(reminder: ReminderModel) {
    const message = ['Do you want to delete this reminder? (This will also delete all other occurences for this reminder)',
                    `Subject: ${reminder.subject}`,
                    `Note: ${reminder.note}`,
                    `Type: ${reminder.type}`,
                    ]
    this.confirmationService.confirm({
        message: message.join('<br/>'),
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            this.reminderService.deleteReminder(reminder.id!)
              .pipe(
                take(1)
              ).subscribe(v => {
                this.toastService.showSuccess('Delete successful');
              })
        },
        reject: () => {

        }
    });
  }

  createExpense(reminder: ReminderModel) {
    this.dialogService.open(ExpenseDetailComponent, {
      width: '420px',
      header: 'Create',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      styleClass: 'component-dialog',
      closeOnEscape: true,
      data: {
        isDialog: true,
        expense: {
          amount: reminder.amount,
          categoryId: reminder.categoryId,
          sourceId: reminder.sourceId,
          description: reminder.subject,
          tags: reminder.tags,
          expenseDate: reminder.type == ReminderType.OneTime ? reminder.expenseDate : reminder.date.toISOString()
        }
      }
    });
  }
}
