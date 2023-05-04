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
import { SumPipe } from 'src/app/shared/utils/sum.pipe';
import { ExpenseDto } from '../../model/expense-dto.model';
import { DialogService } from 'primeng/dynamicdialog';
import { ExpenseDetailComponent } from '../expense-detail/expense-detail.page.component';
import { ConfirmationService } from 'primeng/api';
import { ToastService } from 'src/app/shared/utils/toast.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

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
    ConfirmDialogModule
  ],
  providers: [SumPipe, ConfirmationService],
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
  expenseEntries$!: Observable<ExpenseDto[]>;
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


  calendarDate? = new Date();
  calendarLoadingInProgress$ = new BehaviorSubject(false);
  calendarDateRange$ = new BehaviorSubject<any>(undefined);
  dailyTotal$!: Observable<any>;

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
    private toastService: ToastService
  ) {
    this.createForm();
  }

  ngOnInit() {
    // executes every time applyFilter/applyDateFilter is triggered
    this.filter$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
        skip(1),
        tap((x) => {
          this.filterInProgress$.next(true);
        })
      )
      .subscribe((filter) => {
        this.expenseService.initExpenses(filter);
      });

    // data to be used for the table
    this.expenseEntries$ = this.expenseService.getExpenseData().pipe(
      tap((result) => {
        this.filterInProgress$.next(result.status === 'LOADING');
        // every update on the expense entries, trigger the calendar to update the daily summary
        if (!this.filterInProgress$.value) {
          this.calendarDateRange$.next({
            dateFrom: startOfMonth(this.calendarDate ?? new Date()),
            dateTo: endOfMonth(this.calendarDate ?? new Date()),
          });
        }
      }),
      map((result) => {
        return result.data;
      })
    );

    // data to be used for category summarization
    // total per category will used the current expense entries
    this.totalPerCategory$ = this.expenseService.getExpenseData().pipe(
      map(({ data }) => {
        const categoryIds = Array.from(new Set(data.map((d) => d.categoryId)));
        const result = categoryIds.map((categoryId) => {
          const category = data.find(
            (x) => x.categoryId == categoryId
          )?.category;
          const dataPerCategory = data.filter((x) => x.category === category);
          const total = this.sumPipe.transform(dataPerCategory, 'amount');
          return <TotalPerCategory>{
            total,
            category,
            categoryId: Number(categoryId),
          };
        });

        return result.sort((a, b) => b.total - a.total);
      })
    );

    // // auto populate date fields based on view value
    // this will listen to route changes and filter change
    combineLatest([
      this.filterForm.get('view')!.valueChanges.pipe(startWith('')),
      this.route.queryParamMap.pipe(map((v) => v.get('view'))),
    ])
      .pipe(takeUntil(this.ngUnsubscribe$))
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

    // // will execute on initial load
    // view$.pipe(startWith(''), debounceTime(1500), take(1)).subscribe((v) => {
    //   this.applyFilter();
    // });

    // //
    // combineLatest([
    //   this.filterForm.get('dateFrom')!.valueChanges.pipe(startWith('')),
    //   this.filterForm.get('dateTo')!.valueChanges.pipe(startWith('')),
    // ])
    //   .pipe(skip(1), takeUntil(this.ngUnsubscribe$))
    //   .subscribe((v) => {
    //     this.filterForm.get('view')?.setValue(null, { emitEvent: false });
    //   });

    // this will contain the sum of expenses per category
    this.dailyTotal$ = this.calendarDateRange$.pipe(
      filter((v) => !!v),
      debounceTime(500),
      tap(() => this.calendarLoadingInProgress$.next(true)),
      switchMap((filter) => {
        const dateFrom = filter.dateFrom?.toISOString();
        const dateTo = filter.dateTo?.toISOString();
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



    // TODO: UPDATE LOGIC HERE?????
    setTimeout(() => {
      this.applyFilter();
    }, 500);
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

  // TODO: decide if this will be page navigation or will just open a modal
  addEntry() {
    // this.router.navigate(['expenses', 'new']);
    this.dialogService.open(ExpenseDetailComponent, {
      width: '420px',
      header: 'Create',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      styleClass: 'component-dialog',
      closeOnEscape: true,
      data: {
        isDialog: true
      }
    });
  }

  // TODO: udpate model
  editEntry(expense: Expense) {
    // this.router.navigate(['expenses', 'edit', expense.id]);
    this.dialogService.open(ExpenseDetailComponent, {
      width: '420px',
      header: 'Update',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      styleClass: 'component-dialog',
      closeOnEscape: true,
      data: {
        isDialog: true,
        isEdit: true,
        id: expense.id
      }
    });
  }

  deleteEntry(expense: Expense) {
    const message = ['Do you want to delete this entry?',
                    `Amount: ${expense.amount}`,
                    `Date: ${format(new Date(expense.expenseDate), 'MMM/dd/yyyy')}`,
                    `Category: ${expense.category}`,
                    `Description: ${expense.description}`,
                    ]
    this.confirmationService.confirm({
        message: message.join('<br/>'),
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            this.expenseService.deleteExpense(expense.id!)
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

  onSelectedDate(event: any) {}

  applyDateFilter() {
    if (!this.calendarDate) return;

    this.validationMessageService.clear();
    this.filterForm.get('dateFrom')?.setValue(startOfDay(this.calendarDate), { emitEvent: false });
    this.filterForm.get('dateTo')?.setValue(endOfDay(this.calendarDate), { emitEvent: false });
    this.filterForm.get('view')?.setValue(null, { emitEvent: false });
    this.filter$.next({
      dateFrom: this.filterForm.get('dateFrom')?.value,
      dateTo: this.filterForm.get('dateTo')?.value,
      categoryId: this.filterForm.get('category')?.value?.id,
      pageNumber: 0,
      totalRows: 9999, //this.rowsPerPage,
    });
  }
}
