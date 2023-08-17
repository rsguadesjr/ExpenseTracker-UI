import { AfterViewInit, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from 'src/app/expenses/data-access/expense.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  Subject,
  catchError,
  combineLatest,
  debounceTime,
  filter,
  map,
  mergeMap,
  of,
  share,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { PaginatedList } from 'src/app/shared/model/paginated-list.model';
import { Expense } from 'src/app/expenses/model/expense.model';
import { ExpenseListComponent } from 'src/app/expenses/ui/expense-list/expense-list.component';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import {
  startOfWeek,
  endOfWeek,
  format,
  add,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns';
import { SpeedDialModule } from 'primeng/speeddial';
import { DateParamService } from 'src/app/shared/utils/date-param.service';
import { ExpensePerCategoryComponent } from 'src/app/expenses/ui/expense-per-category/expense-per-category.component';
import { SummaryService } from 'src/app/summary/data-access/summary.service';
import { CategoryService } from 'src/app/shared/data-access/category.service';
import { SummaryFilter } from 'src/app/summary/model/summary-filter.model';
import { BudgetService } from 'src/app/shared/data-access/budget.service';
import { SummaryMainChartComponent } from 'src/app/summary/ui/summary-main-chart/summary-main-chart.component';
import { TotalPerCategory } from 'src/app/shared/model/total-per-category.mode';
import { TotalAmountPerCategoryPerDate } from 'src/app/summary/model/total-amount-per-category-per-date';
import { Store } from '@ngrx/store';
import { categorizedExpenses, dailyCategorizedExpenses, savingStatus, selectAllExpenses } from 'src/app/state/expenses/expenses.selector';
import { loadExpenses } from 'src/app/state/expenses/expenses.action';
import { DialogService } from 'primeng/dynamicdialog';
import { ExpenseDetailComponent } from 'src/app/expenses/feature/expense-detail/expense-detail.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ExpenseListComponent,
    ButtonModule,
    RouterModule,
    ChartModule,
    SpeedDialModule,
    ExpensePerCategoryComponent,
    SummaryMainChartComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  store = inject(Store);
  categoryService = inject(CategoryService);
  dialogService = inject(DialogService);
  date = new Date();

  expenses$ = this.store.select(selectAllExpenses);
  categorizedExpenses$ = this.store.select(categorizedExpenses);
  dailyCategorizedExpenses$ = this.store.select(dailyCategorizedExpenses);
  savingInProgress$ = this.store.select(savingStatus);

  recentTransactions$ = this.expenses$.pipe(
    map((expenses) => expenses.slice(0, 10))
  );

  totalExpenses$ = this.expenses$.pipe(
    map((expenses) => {
      return expenses.reduce((total, current) => total + current.amount, 0);
    })
  );

  chartData$ = combineLatest([
    this.categoryService.getCategories(),
    this.dailyCategorizedExpenses$
  ]).pipe(
    map(([categories, data]) => {
      const filter: SummaryFilter = {
        view: 'month',
        startDate: startOfMonth(this.date),
        endDate: endOfMonth(this.date),
        breakdown: false,
        categoryIds: categories.map((x) => x.id),
        showBudget: false,
      };
      return { categories, data, filter, budgets: [] as any[] };
    })
  );


  ngOnInit() {
    this.store.dispatch(
      loadExpenses({
        params: {
          dateFrom: this.dateRange.startDate,
          dateTo: this.dateRange.endDate,
          pageNumber: 0,
          totalRows: 9999, //this.rowsPerPage,
        },
      })
    );
  }

  editEntry(expense: any) {
    // this.router.navigate(['/expenses', 'new']);
    const dialgoRef = this.dialogService.open(ExpenseDetailComponent, {
      width: '420px',
      header: 'Create',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      styleClass: 'component-dialog',
      closeOnEscape: true,
      data: {
        isDialog: true,
        expense
      },

    })
  }

  // filter$ = new BehaviorSubject<any>(null);

  // filterInProgress$ = new BehaviorSubject<boolean>(false);
  // date = new Date();
  // view: string = 'month';
  // dateRangeLabel = '';

  // selectedView$: Observable<string> = this.route.queryParamMap.pipe(
  //   map((v) => {
  //     const view = v.get('view')?.toLowerCase();
  //     return view && ['day', 'week', 'month', 'year'].includes(view)
  //       ? view
  //       : 'month';
  //   })
  // );

  // data$: Observable<Expense[]> = this.expenseService
  //   .getExpenseData()
  //   .pipe(map((x) => x.data.slice(0, 10)));

  // totalExpenses$: Observable<number> = this.expenseService
  //   .getExpenseData()
  //   .pipe(
  //     map((v) => {
  //       const items = v.data;
  //       return items.reduce((total, current) => total + current.amount, 0);
  //     })
  //   );

  // // perCategoryData$: Observable<TotalPerCategory[]> = this.summaryService
  // //   .getTotalAmountPerCategory(this.dateRange.startDate, this.dateRange.endDate)
  // //   .pipe(share());
  // perCategoryData$: Observable<TotalPerCategory[]> = combineLatest([
  //   this.categoryService.getCategories(),
  //   this.expenseService.getExpenseData(),
  // ]).pipe(
  //   map(([categories, v]) => {
  //     const items = v.data;
  //     const data = categories.map((cat) => {
  //       const totalPerCategory = items
  //         .filter((x) => x.categoryId == cat.id)
  //         .reduce((total, current) => total + current.amount, 0);
  //       return <TotalPerCategory>{
  //         total: totalPerCategory,
  //         categoryId: cat.id,
  //         category: cat.name,
  //       };
  //     });

  //     return data
  //       .filter((x) => x.total > 0)
  //       .sort((a, b) => (a.total < b.total ? 0 : -1));
  //   })
  // );

  // perDateTotal$ = this.expenseService.getExpenseData().pipe(
  //   map((v) => v.data),
  //   map((items) => {
  //     const dates = Array.from(new Set(items.map((x) => x.expenseDate)));
  //     const result: TotalAmountPerCategoryPerDate[] = [];

  //     dates.forEach((date) => {
  //       const itemsPerDate = items.filter((x) => x.expenseDate == date);
  //       const categorIds = Array.from(
  //         new Set(itemsPerDate.map((x) => x.categoryId))
  //       );

  //       categorIds.forEach((id) => {
  //         const total = itemsPerDate
  //           .filter((x) => x.categoryId == id)
  //           .reduce((total, current) => total + current.amount, 0);
  //         const data: TotalAmountPerCategoryPerDate = {
  //           total,
  //           expenseDate: date,
  //           categoryId: id,
  //           category:
  //             itemsPerDate.find((x) => x.categoryId == id)?.category ?? '',
  //         };

  //         result.push(data);
  //       });
  //     });

  //     return result;
  //   })
  // );

  // constructor(
  //   private expenseService: ExpenseService,
  //   private router: Router,
  //   private route: ActivatedRoute,
  //   private summaryService: SummaryService,
  //   private dateParamService: DateParamService,
  //   private categoryService: CategoryService,
  //   private budgetService: BudgetService
  // ) {
  //   // trigger api call, this will only trigger once since we are only displaying the top 10 latest transactions
  //   this.expenseService.initExpenses({
  //     dateFrom: this.dateRange.startDate,
  //     dateTo: this.dateRange.endDate,
  //     pageNumber: 0,
  //     totalRows: 9999, //this.rowsPerPage,
  //   });
  // }

  // editEntry(expense: any) {
  //   this.router.navigate(['expenses', 'edit', expense.id]);
  // }

  // updateView(view: string) {
  //   this.router.navigate(['/'], { queryParams: { view } });
  // }

  // viewExpenses() {
  //   this.router.navigate(['/expenses'], {
  //     queryParams: {
  //       startDate: this.filter$.value?.startDate,
  //       endDate: this.filter$.value?.endDate,
  //     },
  //   });
  // }

  // newEntry() {
  //   this.router.navigate(['/expenses', 'new']);
  // }

  get dateRange() {
    return {
      startDate: startOfMonth(this.date).toISOString(),
      endDate: endOfMonth(this.date).toISOString(),
    };
  }
}
