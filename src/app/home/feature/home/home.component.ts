import { AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from 'src/app/expenses/data-access/expense.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  Subject,
  catchError,
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
import { SummaryService } from 'src/app/shared/data-access/summary.service';
import { SpeedDialModule } from 'primeng/speeddial';
import { DateParamService } from 'src/app/shared/utils/date-param.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ExpenseListComponent,
    ButtonModule,
    RouterModule,
    ChartModule,
    SpeedDialModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit {
  filter$ = new BehaviorSubject<any>(null);
  data$!: Observable<Expense[]>;
  filterInProgress$ = new BehaviorSubject<boolean>(false);
  selectedView$: Observable<string>;
  totalExpenses$: Observable<number>;

  view: string = 'week';
  dateRangeLabel = '';

  basicData: any;
  basicOptions: any;

  codeTest = 'Template <script>alert("Test")</script>';

  constructor(
    private expenseService: ExpenseService,
    private router: Router,
    private route: ActivatedRoute,
    private summaryService: SummaryService,
    private dateParamService: DateParamService
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
          : 'day';
      })
    );

    // each change of view or route changes will trigger the api call to get the total
    this.totalExpenses$ = this.selectedView$.pipe(
      debounceTime(500),
      switchMap((view: any) => {
        const value = this.dateParamService.getDateRange(view);
        return this.summaryService.getTotalAmountPerCategory(
          value.startDate,
          value.endDate
        )
      }),
      map((v) => {
        return v
          .map((r) => r.total)
          .reduce((total, current) => total + current, 0);
      })
    );
  }
  ngAfterViewInit(): void {
    this.codeTest = 'haha';
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
}
