import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  combineLatest,
  map,
} from 'rxjs';
import { ExpenseListComponent } from 'src/app/expenses/ui/expense-list/expense-list.component';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import {
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import { SpeedDialModule } from 'primeng/speeddial';
import { ExpensePerCategoryComponent } from 'src/app/expenses/ui/expense-per-category/expense-per-category.component';
import { SummaryFilter } from 'src/app/summary/model/summary-filter.model';
import { SummaryMainChartComponent } from 'src/app/summary/ui/summary-main-chart/summary-main-chart.component';
import { Store } from '@ngrx/store';
import { categorizedExpenses, dailyCategorizedExpenses, savingStatus, selectAllExpenses } from 'src/app/state/expenses/expenses.selector';
import { loadExpenses } from 'src/app/state/expenses/expenses.action';
import { DialogService } from 'primeng/dynamicdialog';
import { ExpenseDetailComponent } from 'src/app/expenses/feature/expense-detail/expense-detail.component';
import { selectAllCategories } from 'src/app/state/categories/categories.selector';

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
    this.store.select(selectAllCategories),
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
    this.dialogService.open(ExpenseDetailComponent, {
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

  get dateRange() {
    return {
      startDate: startOfMonth(this.date).toISOString(),
      endDate: endOfMonth(this.date).toISOString(),
    };
  }
}
