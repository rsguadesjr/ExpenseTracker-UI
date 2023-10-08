import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  delay,
  map,
  of,
  skip,
  startWith,
  Subject,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';
import { FormGroup, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { ExpenseResponseModel } from '../../model/expense-response.model';
import { CalendarModule } from 'primeng/calendar';
import { ExpenseListComponent } from '../../ui/expense-list/expense-list.component';
import { ExpenseTableViewComponent } from '../../ui/expense-table-view/expense-table-view.component';
import { ExpensePerCategoryComponent } from '../../ui/expense-per-category/expense-per-category.component';
import { DateParamService } from 'src/app/shared/utils/date-param.service';
import { Option } from 'src/app/shared/model/option.model';
import {
  addMonths,
  endOfMonth,
  format,
  isSameDay,
  startOfMonth,
} from 'date-fns';
import { SumPipe } from 'src/app/shared/utils/sum.pipe';
import { DialogService } from 'primeng/dynamicdialog';
import { ExpenseFormComponent } from '../expense-form/expense-form.component';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ReminderModel } from 'src/app/shared/model/reminder-model';
import { TooltipModule } from 'primeng/tooltip';
import { AccessDirective } from 'src/app/shared/utils/access.directive';
import { SummaryService } from 'src/app/summary/data-access/summary.service';
import { Store } from '@ngrx/store';
import {
  savingStatus,
  selectAllExpenses,
  selectFilteredExpenses,
} from 'src/app/state/expenses/expenses.selector';
import {
  deleteExpense,
  loadExpenses,
} from 'src/app/state/expenses/expenses.action';
import { CalendarComponent } from 'src/app/shared/feature/calendar/calendar.component';
import { ReminderType } from 'src/app/shared/enums/reminder-type';
import { selectFormattedReminders } from 'src/app/state/reminders/reminders.selector';
import { DropdownModule } from 'primeng/dropdown';
import { ExpenseRequestModel } from '../../model/expense-request.model';
import { CalendarItem } from 'src/app/shared/model/calendar-item';
import { ExpenseService } from '../../data-access/expense.service';

@Component({
  selector: 'app-expense-list-page',
  standalone: true,
  imports: [
    CommonModule,
    DataViewModule,
    ButtonModule,
    ReactiveFormsModule,
    CalendarModule,
    DropdownModule,
    ExpenseListComponent,
    ExpenseTableViewComponent,
    ExpensePerCategoryComponent,
    SumPipe,
    ConfirmDialogModule,
    DecimalPipe,
    TooltipModule,
    AccessDirective,
    CalendarComponent,
  ],
  providers: [SumPipe, DecimalPipe],
  templateUrl: './expense-page.component.html',
  styleUrls: ['./expense-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpensePageComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  private summaryService = inject(SummaryService);
  private dateParamService = inject(DateParamService);
  private dialogService = inject(DialogService);
  private confirmationService = inject(ConfirmationService);
  private decimalPipe = inject(DecimalPipe);
  private store = inject(Store);
  private cdr = inject(ChangeDetectorRef);
  private expenseService = inject(ExpenseService);

  rowsPerPage: number = 10;
  currentPage: number = 0;
  dateViewOptions: Option[] = [
    { id: '', name: '' },
    { id: 'day', name: 'Today' },
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'Month' },
    { id: 'year', name: 'Year' },
  ];

  monthOptions: Option[] = [];
  calendarDate = new Date();
  selectedDate$ = new BehaviorSubject<Date>(new Date());
  calendarMonth$ = new BehaviorSubject<{ month: Date; refresh: boolean }>({
    month: new Date(),
    refresh: false,
  });

  filteredExpenses$ = new BehaviorSubject<ExpenseResponseModel[] | null>(null);
  filterParams$ = new BehaviorSubject<{ startDate: Date; endDate: Date }>({
    startDate: startOfMonth(this.calendarDate),
    endDate: endOfMonth(this.calendarDate),
  });

  filterInProgress$ = new BehaviorSubject<boolean>(false);
  expenses$ = this.filterParams$.pipe(
    switchMap((params) => {
      return this.store.select(
        selectAllExpenses({
          startDate: params.startDate,
          endDate: params.endDate,
        })
      );
    })
  );
  // expenses$ = this.store.select(selectAllExpenses());
  categorizedExpenses$ = this.expenses$.pipe(
    map((exp) => this.expenseService.categorizedExpenses(exp))
  );
  savingStatus$ = this.store.select(savingStatus);

  reminders$ = this.calendarMonth$.pipe(
    switchMap(({ month }) => {
      const startDate = startOfMonth(month).toISOString();
      const endDate = endOfMonth(month).toISOString();
      return this.store.select(
        selectFormattedReminders({ startDate, endDate })
      );
    })
  );

  calendarItems$ = combineLatest([
    this.summaryService.getDailyTotalByDateRange(),
    this.reminders$,
  ]).pipe(
    map(([dailyTotal, reminders]) => {
      // calendar items for daily summary
      const dailyTotalItem: CalendarItem = {
        type: 'DailyTotal',
        items: dailyTotal.map((v) => ({
          date: new Date(v.expenseDate),
          value: this.decimalPipe.transform(v.total, '1.0'),
        })),
      };

      // calendar items for reminders
      const dates = reminders
        .filter(
          (r, i) => reminders.findIndex((e) => isSameDay(e.date, r.date)) === i
        )
        .map((r) => r.date);

      const reminderItem: CalendarItem = {
        type: 'Reminders',
        items: dates.map((date) => ({
          date,
          value: reminders.filter((r) => isSameDay(date, r.date)).length,
        })),
      };

      return [dailyTotalItem, reminderItem];
    })
  );

  selectedDateReminders$ = combineLatest([
    this.selectedDate$,
    this.reminders$,
  ]).pipe(
    map(([date, reminders]) => {
      return reminders.filter((r) => isSameDay(date, r.date));
    })
  );

  filterForm = new FormGroup({
    view: new FormControl('month'),
    dateFrom: new FormControl(),
    dateTo: new FormControl(),
    month: new FormControl(),
    category: new FormControl(),
  });

  ngOnInit() {
    this.initMonthOptions();

    // set date range values for month
    this.filterForm
      .get('month')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        if (value) {
          this.filterForm
            .get('dateFrom')
            ?.setValue(new Date(value.startDate), { emitEvent: false });
          this.filterForm
            .get('dateTo')
            ?.setValue(new Date(value.endDate), { emitEvent: false });
        }
      });

    this.filterForm
      .get('view')
      ?.valueChanges.pipe(startWith('month'), takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        if (!value) return;

        if (value === 'month') {
          const currentDate = new Date();
          const monthData = {
            startDate: startOfMonth(currentDate),
            endDate: endOfMonth(currentDate),
          };
          this.filterForm
            .get('month')
            ?.setValue(monthData, { emitEvent: false });
          this.filterForm
            .get('dateFrom')
            ?.setValue(new Date(monthData.startDate), { emitEvent: false });
          this.filterForm
            .get('dateTo')
            ?.setValue(new Date(monthData.endDate), { emitEvent: false });
        } else {
          const dateParam = this.dateParamService.getDateRange(value as any);
          this.filterForm
            .get('dateFrom')
            ?.setValue(new Date(dateParam.startDate), { emitEvent: false });
          this.filterForm
            .get('dateTo')
            ?.setValue(new Date(dateParam.endDate), { emitEvent: false });
        }
      });

    this.calendarMonth$
      .pipe(debounceTime(500), takeUntil(this.unsubscribe$))
      .subscribe(({ month, refresh }) => {
        const startDate = startOfMonth(month).toISOString();
        const endDate = endOfMonth(month).toISOString();
        this.summaryService.fetchDailyTotalByDateRange(
          startDate,
          endDate,
          refresh
        );
        // this.reminderService.fetchReminders(startDate, endDate);
      });

    // if there are successful crud operations, refresh the calendar data
    this.savingStatus$
      .pipe(skip(1), takeUntil(this.unsubscribe$))
      .subscribe((status) => {
        if (status === 'success') {
          this.calendarMonth$.next({
            ...this.calendarMonth$.value,
            refresh: true,
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  initMonthOptions() {
    const currentYear = new Date().getFullYear();
    const currentDate = new Date(currentYear, 0);
    this.monthOptions = new Array(12).fill(0).map((_, i) => {
      const month = addMonths(currentDate, i);
      return {
        id: { startDate: startOfMonth(month), endDate: endOfMonth(month) },
        name: format(month, 'MMM-yyyy'),
      };
    });
  }

  applyFilter() {
    const params = {
      dateFrom: this.filterForm.get('dateFrom')?.value,
      dateTo: this.filterForm.get('dateTo')?.value,
      pageNumber: 0,
      totalRows: 9999, //this.rowsPerPage,
    };

    this.store.dispatch(loadExpenses({ params }));
    this.filterParams$.next({
      startDate: params.dateFrom,
      endDate: params.dateTo,
    });
  }

  clearFilter() {}

  addEntry(expense?: any) {
    const dialgoRef = this.dialogService.open(ExpenseFormComponent, {
      width: '420px',
      header: 'Create',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      styleClass: 'component-dialog',
      closeOnEscape: true,
      data: {
        isDialog: true,
        expense,
      },
    });
  }

  editEntry(expense: ExpenseResponseModel) {
    this.dialogService.open(ExpenseFormComponent, {
      width: '420px',
      header: 'Update',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      styleClass: 'component-dialog',
      closeOnEscape: true,
      data: {
        isDialog: true,
        isEdit: true,
        expense: {
          id: expense.id,
          amount: expense.amount,
          categoryId: expense.category?.id,
          description: expense.description,
          expenseDate: expense.expenseDate,
          sourceId: expense.source?.id,
          tags: expense.tags,
        } as ExpenseRequestModel,
      },
    });
  }

  deleteEntry(expense: any) {
    const message = [
      'Do you want to delete this entry?',
      `Amount: ${expense.amount}`,
      `Date: ${format(new Date(expense.expenseDate), 'MMM/dd/yyyy')}`,
      `Category: ${expense.category?.name}`,
      `Description: ${expense.description}`,
    ];
    this.confirmationService.confirm({
      message: message.join('<br/>'),
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.store.dispatch(deleteExpense({ id: expense.id }));
      },
      reject: () => {},
    });
  }

  onPageChange(event: any) {
    this.currentPage = event.page;
    this.rowsPerPage = event.rows;
  }

  onFilterChange(data: ExpenseResponseModel[]) {
    this.filteredExpenses$.next([...data]);
    this.cdr.detectChanges();
  }

  selectDate(date: Date) {
    this.calendarDate = date;
    this.selectedDate$.next(date);
  }

  monthChange({ year, month }: { year: number; month: number }) {
    this.calendarMonth$.next({ month: new Date(year, month), refresh: false });
  }

  createExpense(reminder: ReminderModel) {
    const expense = {
      amount: reminder.amount,
      categoryId: reminder.categoryId,
      sourceId: reminder.sourceId,
      description: reminder.subject,
      tags: (reminder.tags || '').split(','),
      expenseDate:
        reminder.type == ReminderType.OneTime
          ? reminder.expenseDate
          : reminder.date.toISOString(),
    };

    this.addEntry(expense);
  }
}
