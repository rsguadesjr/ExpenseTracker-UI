import { Component } from '@angular/core';
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
export class HomeComponent {
  filter$ = new BehaviorSubject<any>(null);
  data$!: Observable<PaginatedList<Expense>>;
  filterInProgress$ = new BehaviorSubject<boolean>(false);
  selectedView$: Observable<string>;
  totalExpenses$: Observable<number>;

  view: string = 'week';
  dateRangeLabel = '';

  basicData: any;
  basicOptions: any;

  constructor(
    private expenseService: ExpenseService,
    private router: Router,
    private route: ActivatedRoute,
    private summaryService: SummaryService
  ) {
    this.selectedView$ = this.route.queryParamMap.pipe(
      map((v) => {
        const view = v.get('view')?.toLowerCase();
        return view && ['day', 'week', 'month', 'year'].includes(view)
          ? view
          : 'day';
      })
    );

    const filter$ = this.selectedView$.pipe(
      map((view) => {
        let startDate;
        let endDate;
        let date = new Date();
        switch (view) {
          case 'week':
            date =
              new Date().getDay() == 0
                ? add(new Date(), { days: -1 })
                : new Date();
            startDate = add(startOfWeek(date), { days: 1 });
            endDate = add(endOfWeek(date), { days: 1 });
            this.dateRangeLabel = `${format(startDate, 'MMMM dd')} - ${format(
              endDate,
              'MMMM dd'
            )}`;
            break;
          case 'month':
            startDate = startOfMonth(date);
            endDate = endOfMonth(date);
            this.dateRangeLabel = `Month of ${format(date, 'MMMM')}`;
            break;
          case 'year':
            startDate = startOfYear(date);
            endDate = endOfYear(date);
            this.dateRangeLabel = `Year ${format(date, 'yyyy')}`;
            break;
          case 'day':
          default:
            startDate = startOfDay(date);
            endDate = endOfDay(date);
            this.dateRangeLabel = `${format(date, 'MMMM dd')}`;
            break;
        }

        return {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        };
      }),
      tap((value) => {
        this.filter$.next({
          startDate: value.startDate,
          endDate: value.endDate,
        });
      })
    );

    this.totalExpenses$ = filter$.pipe(
      debounceTime(500),
      switchMap((value) =>
        this.summaryService.getTotalAmountPerCategory(
          value.startDate,
          value.endDate
        )
      ),
      map((v) => {
        return v
          .map((r) => r.total)
          .reduce((total, current) => total + current, 0);
      })
    );

    this.data$ = filter$.pipe(
      take(1),
      switchMap((value) => expenseService.getExpenses(value))
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
}
