import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  delay,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  share,
  skip,
  startWith,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { ExpenseService } from '../../data-access/expense.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormsModule,
  FormGroup,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
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
import { TagModule } from 'primeng/tag';
import { Expense } from '../../model/expense.model';
import { ToolbarModule } from 'primeng/toolbar';
import { CalendarModule } from 'primeng/calendar';
import { PaginatorModule } from 'primeng/paginator';
import { ExpenseListComponent } from '../../ui/expense-list/expense-list.component';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ExpenseTableViewComponent } from '../../ui/expense-table-view/expense-table-view.component';
import { TabViewModule } from 'primeng/tabview';
import { ExpensePerCategoryComponent } from '../../ui/expense-per-category/expense-per-category.component';
import { TotalPerCategory } from 'src/app/shared/model/total-per-category.mode';
import { CardModule } from 'primeng/card';
import { DateParamService } from 'src/app/shared/utils/date-param.service';
import { Option } from 'src/app/shared/model/option.model';
import { ValidationMessageService } from 'src/app/shared/utils/validation-message.service';
import { BadgeModule } from 'primeng/badge';
import {
  addMonths,
  endOfDay,
  endOfMonth,
  format,
  isSameDay,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import { SumPipe } from 'src/app/shared/utils/sum.pipe';
import { DialogService } from 'primeng/dynamicdialog';
import { ExpenseDetailComponent } from '../expense-detail/expense-detail.component';
import { ConfirmationService } from 'primeng/api';
import { ToastService } from 'src/app/shared/utils/toast.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ReminderCalendarComponent } from 'src/app/shared/ui/reminder-calendar/reminder-calendar.component';
import { ReminderModel } from 'src/app/shared/model/reminder-model';
import { CalendarDataComponent } from 'src/app/expenses/feature/calendar-data/calendar-data.component';
import { TotalPerDate } from 'src/app/shared/model/total-per-date';
import { TooltipModule } from 'primeng/tooltip';
import { AccessDirective } from 'src/app/shared/utils/access.directive';
import { ReminderService } from 'src/app/reminders/data-access/reminder.service';
import { SummaryService } from 'src/app/summary/data-access/summary.service';
import { Store } from '@ngrx/store';
import {
  categorizedExpenses,
  savingStatus,
  selectAllExpenses,
} from 'src/app/state/expenses/expenses.selector';
import {
  deleteExpense,
  loadExpenses,
} from 'src/app/state/expenses/expenses.action';
import {
  CalendarComponent,
  ItemType,
} from 'src/app/shared/feature/calendar/calendar.component';
import { ReminderType } from 'src/app/shared/enums/reminder-type';
import { selectFormattedReminders } from 'src/app/state/reminders/reminders.selector';

@Component({
  selector: 'app-expense-list-page',
  standalone: true,
  imports: [
    CommonModule,
    DataViewModule,
    ButtonModule,
    TagModule,
    FormsModule,
    ReactiveFormsModule,
    ToolbarModule,
    CalendarModule,
    PaginatorModule,
    ExpenseListComponent,
    SelectButtonModule,
    ExpenseTableViewComponent,
    TabViewModule,
    ExpensePerCategoryComponent,
    CardModule,
    BadgeModule,
    SumPipe,
    ConfirmDialogModule,
    ReminderCalendarComponent,
    DecimalPipe,
    CalendarDataComponent,
    TooltipModule,
    AccessDirective,
    CalendarComponent,
  ],
  providers: [SumPipe, ConfirmationService, DecimalPipe],
  templateUrl: './expense-page.component.html',
  styleUrls: ['./expense-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpensePageComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  private store = inject(Store);

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
  calendarMonth$ = new BehaviorSubject<Date>(new Date());
  filteredItems$ = new BehaviorSubject<Expense[] | null>(null);
  filterInProgress$ = new BehaviorSubject<boolean>(false);

  expenseEntries$ = this.store.select(selectAllExpenses);
  categorizedExpenses$ = this.store.select(categorizedExpenses);
  savingStatus$ = this.store.select(savingStatus);

  reminders$ = this.calendarMonth$.pipe(
    switchMap((month) => {
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
      const dailyTotalItem: ItemType = {
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

      const reminderItem: ItemType = {
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

  constructor(
    private router: Router,
    private expenseService: ExpenseService,
    private route: ActivatedRoute,
    private summaryService: SummaryService,
    private dateParamService: DateParamService,
    private validationMessageService: ValidationMessageService,
    private sumPipe: SumPipe,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    private reminderService: ReminderService,
    public decimalPipe: DecimalPipe,
    private cdr: ChangeDetectorRef
  ) {

  }

  ngOnInit() {
    this.initMonthOptions();

    // initial trigger on load - delayed
    of()
      .pipe(startWith(''), delay(500), take(1))
      .subscribe(() => {
        this.applyFilter();
      });

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
      .pipe(
        startWith(new Date()),
        debounceTime(500),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((date) => {
        const startDate = startOfMonth(date).toISOString();
        const endDate = endOfMonth(date).toISOString();
        this.summaryService.fetchDailyTotalByDateRange(
          startDate,
          endDate,
          true
        );
        // this.reminderService.fetchReminders(startDate, endDate);
      });

    // if there are successful crud operations, refresh the calendar data
    this.savingStatus$
      .pipe(skip(1), takeUntil(this.unsubscribe$))
      .subscribe((status) => {
        if (status === 'success') {
          this.calendarMonth$.next(this.calendarMonth$.value);
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
  }

  clearFilter() {}

  addEntry(expense?: any) {
    const dialgoRef = this.dialogService.open(ExpenseDetailComponent, {
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

  editEntry(expense: any) {
    this.dialogService.open(ExpenseDetailComponent, {
      width: '420px',
      header: 'Create',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      styleClass: 'component-dialog',
      closeOnEscape: true,
      data: {
        isDialog: true,
        isEdit: true,
        expense,
      },
    });
  }

  deleteEntry(expense: any) {
    const message = [
      'Do you want to delete this entry?',
      `Amount: ${expense.amount}`,
      `Date: ${format(new Date(expense.expenseDate), 'MMM/dd/yyyy')}`,
      `Category: ${expense.category}`,
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

  onFilterChange(data: Expense[]) {
    this.cdr.detectChanges();
  }

  selectDate(date: Date) {
    this.calendarDate = date;
    this.selectedDate$.next(date);
  }

  monthChange({ year, month }: { year: number; month: number }) {
    this.calendarMonth$.next(new Date(year, month));
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
