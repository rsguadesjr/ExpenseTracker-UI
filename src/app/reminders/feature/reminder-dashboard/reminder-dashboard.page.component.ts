import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { DataTableComponent } from 'src/app/shared/feature/data-table/data-table.component';
import { DataTableColumn } from 'src/app/shared/model/data-table-column';
import { AccessDirective } from 'src/app/shared/utils/access.directive';
import { ReminderService } from '../../data-access/reminder.service';
import { add, eachDayOfInterval, endOfMonth, format, isSameDay, startOfDay, startOfMonth } from 'date-fns';
import { BehaviorSubject, Observable, Subject, combineLatest, debounceTime, map, startWith, switchMap, take, takeUntil, takeWhile, tap } from 'rxjs';
import { ReminderType } from 'src/app/shared/enums/reminder-type';
import { ReminderModel } from 'src/app/shared/model/reminder-model';
import { DialogService } from 'primeng/dynamicdialog';
import { ReminderFormComponent } from 'src/app/reminders/feature/reminder-form/reminder-form.component';
import { ConfirmationService } from 'primeng/api';
import { ToastService } from 'src/app/shared/utils/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reminder-dashboard.page',
  standalone: true,
  imports: [
    CommonModule,
    CalendarModule,
    FormsModule,
    DataTableComponent,
    AccessDirective,
    DecimalPipe
  ],
  providers: [DecimalPipe],
  templateUrl: './reminder-dashboard.page.component.html',
  styleUrls: ['./reminder-dashboard.page.component.scss']
})
export class ReminderDashboardPageComponent implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject();

  calendarDate = new Date();
  month = new Date();
  upcomingReminders: ReminderModel[] = [];

  reminderService = inject(ReminderService);
  decimalPipe = inject(DecimalPipe);
  dialogService = inject(DialogService);
  confirmationService = inject(ConfirmationService);
  toastService = inject(ToastService);
  router = inject(Router);

  columns: DataTableColumn[] = [
    { header: 'Subject', field: 'subject' },
    { header: 'Note', field: 'note' },
    { header: 'Type', field: 'type', formatValue: (value: any) => {
      if (value.type == ReminderType.Daily) return 'Daily'
      if (value.type == ReminderType.Weekly) return 'Weekly'
      if (value.type == ReminderType.Monthly) return 'Monthly'
      if (value.type == ReminderType.Yearly) return 'Yearly'
      else return 'OneTime'
    } },
    { header: 'Earliest Date', field: 'earliestDate', formatValue: (value: any) =>  format(value.earliestDate, 'MMM-do(EEE)')},
    { header: 'Occurences', field: 'occurenceDates', html: (value: any) => {
      return value.occurenceDates.map((date: Date) => `<span class="white-space-nowrap">${format(date, 'MMM-do(EEE)')}</span>`).join('<br>');
    } },
    { header: 'Amount', field: 'amount' },
    { header: 'Category', field: 'category' },
    { header: 'Source', field: 'source' },
    { header: 'Tags', field: 'tags' },
    { header: 'Status', field: 'isActive', formatValue: (value) => value.isActive ? 'Active' : 'Inactive' }
  ];


  calendarData$:Observable<any> = this.reminderService.getTansformedData().pipe(
    map(v => {
      if (v.data.length > 0) {
        let data = v.data;
        let dates = eachDayOfInterval({ start: new Date(v.params.startDate), end: new Date(v.params.endDate) });
        let calendarData: any = {};
        for (let date of dates) {
          const reminders = data.filter((x) => isSameDay(x.date, date));
          calendarData[`${format(date, 'yyyy-MM-dd')}`] = reminders.length;
        }

        return calendarData;
      }

      return {}
    })
  )

  reminders$:Observable<any> = this.reminderService.getTansformedData().pipe(
    map(v => {
      // distinct the result
      let data = v.data;
      let ids = Array.from(new Set(data.map(x => x.id)));
      let uniqueData = ids.map(id => {
        // get all entries
        const entries = data.filter(x => x.id == id);
        // get one item from the entries
        const entry = entries[0];
        return { ...entry, occurenceDates: entries.map(v => v.date), earliestDate: entry.date };
      })
      return uniqueData;
    })
  )

  showLoading$:Observable<boolean> = this.reminderService.getProcessState().pipe(
    map(v => v === 'LOADING'),
  )


  /**
   * will trigger the fetching of the data
   */
  fetchReminder$ = new BehaviorSubject<void>(undefined);

  ngOnInit() {
    // subsubcribe to month change to fetch new reminders
    this.fetchReminder$.pipe(
      debounceTime(500),
      takeUntil(this.ngUnsubscribe$),
    )
    .subscribe(() => {
      this.reminderService.fetchReminders(this.monthDateRange.startDate, this.monthDateRange.endDate);
    });


    // initially get the list
    // update the list if there are updated/created/deleted item
    this.reminderService.getTansformedData().pipe(
      take(2),
      map(v => v.data),
      switchMap((data) => {
        this.upcomingReminders = data;
        return combineLatest([
          this.reminderService.getCreatedOrUpdatedItem().pipe(startWith([])),
          this.reminderService.getDeletedId().pipe(startWith(null))
        ])
      }),
      takeUntil(this.ngUnsubscribe$)
    ).subscribe(([lastCreatedOrUpdated, deletedId]) => {
      // remove deleted item if any
      if (deletedId) {
        this.upcomingReminders = this.upcomingReminders.filter(x => x.id != deletedId);
      }

      // add or update item to the current this.upcomingReminders
      if (lastCreatedOrUpdated?.length > 0) {
        let itemInList = this.upcomingReminders.find(x => x.id == lastCreatedOrUpdated[0].id);
        // if exists, just update
        this.upcomingReminders = this.upcomingReminders.filter(x => x.id != itemInList?.id);
        this.upcomingReminders = [...this.upcomingReminders, ...lastCreatedOrUpdated];
      }

      // prepare date range
      // current range is 5 days
      let startDate = startOfDay(new Date()).getTime();
      let endDate = add(startDate, { days: 5 }).getTime();
      // filter data only within 5 days
      let data = this.upcomingReminders.filter(d =>  {
        let dateTime = startOfDay(d.date).getTime();
        return dateTime >= startDate && dateTime <= endDate;
      })

      // add new property to hold the remaining days before the actual reminder
      data = data.map(d => {
        let interval =  eachDayOfInterval({ start: startDate, end: d.date })
        let remainingDays = interval.length - 1;
        return { ...d, remainingDays }
      })
      this.upcomingReminders = data.sort((a, b) => a.date > b.date ? 1 : (a.date < b.date ? -1 : 0));
    })
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
  }

  onMonthChange(e: any) {
    this.month = new Date(e.year, e.month - 1);
    this.fetchReminder$.next();
  }

  onSelectedDate(e: any) {
  }

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
        reminder
      }
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
          date: this.calendarDate
        } as ReminderModel
      }
    });
  }

  onDelete(reminder: ReminderModel) {
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

  createExpense(e: ReminderModel) {
    const expenseData = {
      amount: e.amount,
      categoryId: e.categoryId,
      sourceId: e.sourceId,
      description: e.subject,
      tags: e.tags,
      expenseDate: e.date
    }
    this.router.navigate(['/expenses', 'new'], { queryParams: { data: JSON.stringify(expenseData) }})
  }

  get monthDateRange() {
    return {
      startDate: startOfMonth(this.month).toISOString(),
      endDate: endOfMonth(this.month).toISOString()
    }
  }
}
