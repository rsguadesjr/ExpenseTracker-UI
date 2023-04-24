import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  filter,
  finalize,
  map,
  Observable,
  of,
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
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Expense } from '../../model/expense.model';
import { ToolbarModule } from 'primeng/toolbar';
import { CalendarModule } from 'primeng/calendar';
import { PaginatorModule } from 'primeng/paginator';
import { PaginatedList } from 'src/app/shared/model/paginated-list.model';
import { ExpenseListComponent } from '../../ui/expense-list/expense-list.component';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ExpenseTableViewComponent } from '../../ui/expense-table-view/expense-table-view.component';
import { TabViewModule } from 'primeng/tabview';
import { ExpensePerCategoryComponent } from '../../ui/expense-per-category/expense-per-category.component';
import { SummaryService } from 'src/app/shared/data-access/summary.service';
import { TotalPerCategory } from 'src/app/shared/model/total-per-category.mode';
import { CardModule } from 'primeng/card';
import { DateParamService } from 'src/app/shared/utils/date-param.service';
import { Option } from 'src/app/shared/model/option.model';
import { ValidationMessageService } from 'src/app/shared/utils/validation-message.service';
import { BadgeModule } from 'primeng/badge';
import {
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  format,
  formatISO,
  isWithinInterval,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import { isSameDay } from 'date-fns';
// import { ExpenseListRoutingModule } from './expense-list-routing.module';

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
  ],
  templateUrl: './expense-list.page.component.html',
  styleUrls: ['./expense-list.page.component.scss'],
})
export class ExpenseListPageComponent implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject();

  toggleViewStateOptions: Option[] = [
    { name: 'Compact', id: 'compact' },
    { name: 'Table', id: 'table' },
  ];
  toggleViewValue = 'table';


  categories: Option[] = [
    { id: null, name: '' },
    { id: 1, name: 'Bills' },
    { id: 2, name: 'Foods' },
  ];
  filterForm!: FormGroup;
  filter$ = new BehaviorSubject<any>(undefined);
  data$!: Observable<PaginatedList<Expense>>;
  filterInProgress$ = new BehaviorSubject<boolean>(false);
  totalPerCategory$!: Observable<TotalPerCategory[]>;

  rowsPerPage: number = 10;
  currentPage: number = 0;

  dateViewOptions: Option[] = [
    { id: null, name: '' },
    { id: 'day', name: 'Day' },
    { id: 'week', name: 'Week' },
    { id: 'month', name: 'Month' },
    { id: 'year', name: 'Year' },
  ];

  calendarDate?: any;
  calendarLoadingInProgress$ = new BehaviorSubject(false);
  calendarDateRange$ = new BehaviorSubject<any>(undefined);
  dailyTotal$!: Observable<any>;

  constructor(
    private router: Router,
    private expenseService: ExpenseService,
    private route: ActivatedRoute,
    private summaryService: SummaryService,
    private dateParamService: DateParamService,
    private validationMessageService: ValidationMessageService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    // this will contain the id or list of expenses
    this.data$ = this.filter$.pipe(
      filter((v) => !!v),
      tap(() => this.filterInProgress$.next(true)),
      debounceTime(500),
      switchMap((filter) => this.expenseService.getExpenses(filter)),
      tap(() => this.filterInProgress$.next(false)),
      catchError((err) => {
        this.filterInProgress$.next(false);
        // call alert service
        return of<PaginatedList<Expense>>({
          totalRows: 0,
          currentPage: 0,
          data: [],
        });
      })
    );

    // TODO: remove seconds from date params
    // this will contain the sum of expenses per category
    this.totalPerCategory$ = this.filter$.pipe(
      filter((v) => !!v),
      // tap(() => this.filterInProgress$.next(true)),
      debounceTime(500),
      switchMap((filter) => {
        const dateFrom = filter.dateFrom?.toISOString().slice(0, -5) + 'Z';
        const dateTo = filter.dateTo?.toISOString().slice(0, -5) + 'Z';
        return this.summaryService.getTotalAmountPerCategory(dateFrom, dateTo);
      }),
      // tap(() => this.filterInProgress$.next(false)),
      catchError((err) => {
        this.filterInProgress$.next(false);
        // call alert service
        return of<TotalPerCategory[]>([]);
      })
    );

    // this will contain the sum of expenses per category
    this.dailyTotal$ = this.calendarDateRange$.pipe(
      filter((v) => !!v),
      debounceTime(500),
      tap(() => this.calendarLoadingInProgress$.next(true)),
      switchMap((filter) => {
        const dateFrom = filter.dateFrom?.toISOString();
        const dateTo = filter.dateTo?.toISOString(); //?? new Date(2099, 1, 1).toISOString();
        return this.summaryService.getDailyTotalByDateRange(dateFrom, dateTo);
      }),
      map((v) => {
        const summary: any = {};
        const filter = this.calendarDateRange$.value;
        const dates = eachDayOfInterval({
          start: filter.dateFrom,
          end: filter.dateTo,
        });

        for (const date of dates) {
          const sum = v
            .filter((x) => isSameDay(date, new Date(x.expenseDate)))
            .reduce((acc, obj) => acc + obj.total, 0);
          summary[
            `${format(date, 'yyyy')}-${+format(date, 'MM')}-${+format(
              date,
              'dd'
            )}`
          ] = sum || '';
        }

        return summary;
      }),
      tap(() => this.calendarLoadingInProgress$.next(false)),
      catchError((err) => {
        return of({});
      })
    );


    // auto populate date fields based on view value
    const view$ = combineLatest([
      this.filterForm.get('view')!.valueChanges,
      this.route.queryParamMap.pipe(map((v) => v.get('view'))),
    ]);

    view$
      .pipe(takeUntil(this.ngUnsubscribe$), startWith(''))
      .subscribe(([v1, v2]) => {
        const view = v1 || v2 || 'month';
        const dateParam = this.dateParamService.getDateRange(view);

        this.filterForm
          .get('dateFrom')
          ?.setValue(new Date(dateParam.startDate), { emitEvent: false });
        this.filterForm
          .get('dateTo')
          ?.setValue(new Date(dateParam.endDate), { emitEvent: false });
        this.filterForm.get('view')?.setValue(view, { emitEvent: false });
      });

    // will execute on initial load
    view$.pipe(startWith(''), debounceTime(1500), take(1)).subscribe((v) => {
      this.applyFilter();
    });

    //
    combineLatest([
      this.filterForm.get('dateFrom')!.valueChanges.pipe(startWith('')),
      this.filterForm.get('dateTo')!.valueChanges.pipe(startWith('')),
    ])
      .pipe(skip(1), takeUntil(this.ngUnsubscribe$))
      .subscribe((v) => {
        this.filterForm.get('view')?.setValue(null, { emitEvent: false });
      });

    setTimeout(() => {
      const date = new Date();
      this.calendarDateRange$.next({
        dateFrom: startOfMonth(date),
        dateTo: endOfMonth(date),
      });
    }, 500);
    const date = new Date();
    const isoString = formatISO(date);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
  }

  createForm() {
    this.filterForm = new FormGroup({
      view: new FormControl(),
      dateFrom: new FormControl(),
      dateTo: new FormControl(),
      category: new FormControl(),
    });
  }

  getSeverity(status: string): string {
    switch (status) {
      case 'INSTOCK':
        return 'success';
      case 'LOWSTOCK':
        return 'warning';
      case 'OUTOFSTOCK':
        return 'danger';
      default:
        return '';
    }
  }

  // TODO: decide if this will be page navigation or will just open a modal
  addEntry() {
    this.router.navigate(['expenses', 'new']);
  }

  // TODO: udpate model
  editEntry(expense: any) {
    this.router.navigate(['expenses', 'edit', expense.id]);
  }

  applyFilter() {
    if (this.filterInProgress$.value) {
      return;
    }

    if (
      !this.filterForm.get('dateFrom')?.value ||
      !this.filterForm.get('dateFrom')?.value
    ) {
      this.validationMessageService.showWarning(
        '"Date From" and "Date To" fields are required'
      );
      return;
    }

    this.validationMessageService.clear();

    this.filter$.next({
      dateFrom: this.filterForm.get('dateFrom')?.value,
      dateTo: this.filterForm.get('dateTo')?.value,
      categoryId: this.filterForm.get('category')?.value?.id,
      pageNumber: 0,
      totalRows: 9999, //this.rowsPerPage,
    });
  }

  clearFilter() {
    this.filterForm.reset();
    this.calendarDate = undefined;
  }

  onPageChange(event: any) {
    this.currentPage = event.page;
    this.rowsPerPage = event.rows;

    // this.applyFilter();
  }

  onMonthChange(event: any) {
    const date = new Date(event.year, event.month - 1, 1);
    this.calendarDateRange$.next({
      dateFrom: startOfMonth(date),
      dateTo: endOfMonth(date),
    });
  }

  onSelectedDate(event: any) {
  }

  applyDateFilter() {
    if (!this.calendarDate)
      return

    this.validationMessageService.clear();
    this.filterForm.get('dateFrom')?.setValue(startOfDay(this.calendarDate));
    this.filterForm.get('dateTo')?.setValue(endOfDay(this.calendarDate));
    this.filter$.next({
      dateFrom: this.filterForm.get('dateFrom')?.value,
      dateTo: this.filterForm.get('dateTo')?.value,
      categoryId: this.filterForm.get('category')?.value?.id,
      pageNumber: 0,
      totalRows: 9999, //this.rowsPerPage,
    });
  }
}
