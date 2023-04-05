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
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { PaginatedList } from 'src/app/shared/model/paginated-list';
import { Expense } from 'src/app/expenses/model/expense.model';
import { ExpenseListComponent } from 'src/app/expenses/ui/expense-list/expense-list.component';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ExpenseListComponent,
    ButtonModule,
    RouterModule,
    ChartModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  filter$ = new BehaviorSubject<any>({
    dateFrom: new Date(2022, 1, 1),
    dateTo: new Date(2024, 1, 1),
  });
  data$!: Observable<PaginatedList<Expense>>;
  filterInProgress$ = new BehaviorSubject<boolean>(false);
  selectedView$: Observable<string>;

  basicData: any;

  basicOptions: any;

  constructor(
    private expenseService: ExpenseService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.data$ = this.filter$.pipe(
      tap(() => this.filterInProgress$.next(true)),
      debounceTime(500),
      switchMap((filter) => expenseService.getExpenses(filter)),
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

    this.selectedView$ = this.route.queryParamMap.pipe(
      map((v) => {
        const view = v.get('view')?.toLowerCase();
        return view && ['day', 'week', 'month', 'year'].includes(view)
          ? view
          : 'day';
      })
    );


    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.basicData = {
      labels: ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'],
      datasets: [
        {
          label: 'Sales',
          data: [540, 325, 702, 620, 300, 500, 300],
          backgroundColor: [
            'rgba(255, 159, 64, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(153, 202, 255, 0.2)',
            'rgba(103, 102, 255, 0.2)',
            'rgba(153, 102, 155, 0.2)',
          ],
          borderColor: [
            'rgb(255, 159, 64)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)',
            'rgba(153, 202, 255)',
            'rgba(103, 102, 255)',
            'rgba(153, 102, 155)',
          ],
          borderWidth: 1,
        },
      ],
    };

    this.basicOptions = {
      plugins: {
        legend: {
          display: false,
          labels: {
            color: textColor,
            display: false
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: textColorSecondary,
            display: false
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
            display: false
          },
        },
        x: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
            display: false
          },
        },
      },
    };
  }

  editEntry(expense: any) {
    console.log('editEntry', expense);
    this.router.navigate(['expenses', 'edit', expense.id]);
  }

  updateView(view: string) {
    console.log('[DEBUG] updateView', view);
    this.router.navigate(['/'], { queryParams: { view } });
  }
}
