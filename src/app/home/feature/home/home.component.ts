import { AfterViewInit, Component } from '@angular/core';
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
    SummaryMainChartComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  filter$ = new BehaviorSubject<any>(null);
  data$!: Observable<Expense[]>;
  filterInProgress$ = new BehaviorSubject<boolean>(false);
  selectedView$: Observable<string>;

  date = new Date();
  view: string = 'month';
  dateRangeLabel = '';

  perCategoryData$ = this.summaryService.getTotalAmountPerCategory(this.dateRange.startDate, this.dateRange.endDate);
  totalExpenses$: Observable<number> = this. perCategoryData$.pipe(
    map(v => {
      return v.reduce((total, current) => total + current.total, 0)
    })
  );

  chartData$ =  combineLatest([
    this.categoryService.getCategories(),
    this.summaryService.getTotalAmountPerCategoryPerDate(this.dateRange.startDate, this.dateRange.endDate),
    this.budgetService.getBudgets(),
  ]).pipe(
    map(([categories, data, budgets]) => {
      const filter: SummaryFilter = {
        view: 'month',
        startDate: startOfMonth(this.date),
        endDate: endOfMonth(this.date),
        breakdown: false,
        categoryIds: categories.map(x => x.id),
        showBudget: false
      }
      return { categories, data, filter, budgets }
    })
  );

  constructor(
    private expenseService: ExpenseService,
    private router: Router,
    private route: ActivatedRoute,
    private summaryService: SummaryService,
    private dateParamService: DateParamService,
    private categoryService: CategoryService,
    private budgetService: BudgetService
  ) {


    // get the data
    this.data$ = this.expenseService.getExpenseData()
                                    .pipe(map(x => x.data));

    // trigger api call, this will only trigger once since we are only displaying the top 10 latest transactions
    this.expenseService.initExpenses({
      totalRows: 10,
      pageNumber: 0
    })

    // capture route query changes
    this.selectedView$ = this.route.queryParamMap.pipe(
      map((v) => {
        const view = v.get('view')?.toLowerCase();
        return view && ['day', 'week', 'month', 'year'].includes(view)
          ? view
          : 'month';
      })
    );
  }

  editEntry(expense: any) {
    this.router.navigate(['expenses', 'edit', expense.id]);
  }

  updateView(view: string) {
    this.router.navigate(['/'], { queryParams: { view } });
  }

  viewExpenses() {
    this.router.navigate(['/expenses'], {
      queryParams: {
        startDate: this.filter$.value?.startDate,
        endDate: this.filter$.value?.endDate,
      },
    });
  }

  newEntry() {
    this.router.navigate(['/expenses', 'new']);
  }


  /**
   * set to month
   */
  get dateRange() {
    return {
      startDate: startOfMonth(this.date).toISOString(),
      endDate: endOfMonth(this.date).toISOString(),
    }
  }
}
