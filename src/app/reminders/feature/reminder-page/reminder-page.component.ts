import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { DataTableComponent } from 'src/app/shared/feature/data-table/data-table.component';
import { DataTableColumn } from 'src/app/shared/model/data-table-column';
import { AccessDirective } from 'src/app/shared/utils/access.directive';
import { ReminderService } from '../../data-access/reminder.service';
import {
  add,
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  debounceTime,
  map,
  startWith,
  switchMap,
  take,
  takeUntil,
  takeWhile,
  tap,
} from 'rxjs';
import { ReminderType } from 'src/app/shared/enums/reminder-type';
import { ReminderModel } from 'src/app/shared/model/reminder-model';
import { DialogService } from 'primeng/dynamicdialog';
import { ReminderFormComponent } from 'src/app/reminders/feature/reminder-form/reminder-form.component';
import { ConfirmationService } from 'primeng/api';
import { ToastService } from 'src/app/shared/utils/toast.service';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  selectDistinctFormattedReminders,
  selectFormattedReminders,
} from 'src/app/state/reminders/reminders.selector';
import { deleteReminder } from 'src/app/state/reminders/reminders.action';
import {
  CalendarComponent,
  ItemType,
} from 'src/app/shared/feature/calendar/calendar.component';

@Component({
  selector: 'app-reminder-page',
  standalone: true,
  imports: [
    CommonModule,
    CalendarModule,
    FormsModule,
    DataTableComponent,
    AccessDirective,
    DecimalPipe,
    CalendarComponent,
  ],
  providers: [DecimalPipe],
  templateUrl: './reminder-page.component.html',
  styleUrls: ['./reminder-page.component.scss'],
})
export class ReminderPageComponent implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject();

  reminderService = inject(ReminderService);
  decimalPipe = inject(DecimalPipe);
  dialogService = inject(DialogService);
  confirmationService = inject(ConfirmationService);
  toastService = inject(ToastService);
  router = inject(Router);
  store = inject(Store);

  columns: DataTableColumn[] = [
    { header: 'Subject', field: 'subject' },
    { header: 'Note', field: 'note' },
    {
      header: 'Type',
      field: 'type',
      formatValue: (value: any) => {
        if (value.type == ReminderType.Daily) return 'Daily';
        if (value.type == ReminderType.Weekly) return 'Weekly';
        if (value.type == ReminderType.Monthly) return 'Monthly';
        if (value.type == ReminderType.Yearly) return 'Yearly';
        else return 'OneTime';
      },
    },
    {
      header: 'Earliest Date',
      field: 'earliestDate',
      formatValue: (value: any) => format(value.earliestDate, 'MMM-do(EEE)'),
    },
    {
      header: 'Occurences',
      field: 'occurenceDates',
      html: (value: any) => {
        return value.occurenceDates
          .map(
            (date: Date) =>
              `<span class="white-space-nowrap">${format(
                date,
                'MMM-do(EEE)'
              )}</span>`
          )
          .join('<br>');
      },
    },
    { header: 'Amount', field: 'amount' },
    { header: 'Category', field: 'category' },
    { header: 'Source', field: 'source' },
    { header: 'Tags', field: 'tags' },
    {
      header: 'Status',
      field: 'isActive',
      formatValue: (value) => (value.isActive ? 'Active' : 'Inactive'),
    },
    {
      header: '',
      field: 'actions',
      type: 'button',
      icon: 'pi pi-plus',
      width: '60px',
      onClick: (value) => this.createExpense(value),
    },
  ];

  calendarDate = new Date();
  month = new Date();
  calendarMonth$ = new BehaviorSubject<Date>(new Date());

  reminders$ = this.calendarMonth$.pipe(
    switchMap((month) => {
      const startDate = startOfMonth(month).toISOString();
      const endDate = endOfMonth(month).toISOString();
      return this.store.select(
        selectDistinctFormattedReminders({ startDate, endDate })
      );
    })
  );

  upcomingReminders$ = this.store.select(
    selectFormattedReminders({
      startDate: startOfDay(this.calendarDate).toISOString(),
      endDate: addDays(this.calendarDate, 25).toISOString(),
    })
  ).pipe(
    map((upcomingReminders) => {
      let startDate = startOfDay(new Date()).getTime();
      let endDate = add(startDate, { days: 5 }).getTime();
      // filter data only within 5 days
      let data = upcomingReminders.filter(d =>  {
        let dateTime = startOfDay(d.date).getTime();
        return dateTime >= startDate && dateTime <= endDate;
      })
      // add new property to hold the remaining days before the actual reminder
      data = data.map(d => {
        let interval =  eachDayOfInterval({ start: startDate, end: d.date })
        let remainingDays = interval.length - 1;
        return { ...d, remainingDays }
      })
      return data.sort((a, b) => a.date > b.date ? 1 : (a.date < b.date ? -1 : 0));
  }))

  calendarItems$ = this.reminders$.pipe(
    map((reminders) => {
      // calendar items for reminders
      const dates = reminders
        .filter(
          (r, i) => reminders.findIndex((e) => isSameDay(e.date, r.date)) === i
        )
        .map((r) => r.date);

      const reminderItem: ItemType = {
        type: 'Reminders',
        items: dates.map((date) => ({
          date,
          value: reminders.filter((r) => isSameDay(date, r.date)).length,
        })),
      };

      return [reminderItem];
    })
  );


  ngOnInit() {}

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
  }

  monthChange({ year, month }: { year: number; month: number }) {
    this.calendarMonth$.next(new Date(year, month));
  }

  selectDate(e: any) {}

  onEdit(reminder: ReminderModel) {
    this.dialogService.open(ReminderFormComponent, {
      width: '540px',
      header: 'Update',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      styleClass: 'component-dialog',
      closeOnEscape: true,
      data: {
        isEdit: true,
        reminder,
      },
    });
  }

  onCreate() {
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
          date: this.calendarDate,
        } as ReminderModel,
      },
    });
  }

  onDelete(reminder: ReminderModel) {
    const message = [
      'Do you want to delete this reminder? (This will also delete all other occurences for this reminder)',
      `Subject: ${reminder.subject}`,
      `Note: ${reminder.note}`,
      `Type: ${reminder.type}`,
    ];
    this.confirmationService.confirm({
      message: message.join('<br/>'),
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.store.dispatch(deleteReminder({ id: reminder.id }));
      },
      reject: () => {},
    });
  }

  createExpense(e: ReminderModel) {
    // const expenseData = {
    //   amount: e.amount,
    //   categoryId: e.categoryId,
    //   sourceId: e.sourceId,
    //   description: e.subject,
    //   tags: e.tags,
    //   expenseDate: e.date
    // }
    // this.router.navigate(['/expenses', 'new'], { queryParams: { data: JSON.stringify(expenseData) }})
  }

}
