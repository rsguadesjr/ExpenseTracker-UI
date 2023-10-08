import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { ExpenseListComponent } from 'src/app/expenses/ui/expense-list/expense-list.component';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
} from 'date-fns';
import { SpeedDialModule } from 'primeng/speeddial';
import { ExpensePerCategoryComponent } from 'src/app/expenses/ui/expense-per-category/expense-per-category.component';
import { SummaryMainChartComponent } from 'src/app/summary/ui/summary-main-chart/summary-main-chart.component';
import { Store } from '@ngrx/store';
import {
  savingStatus,
  selectCurrentMonthExpenses,
} from 'src/app/state/expenses/expenses.selector';
import { DialogService } from 'primeng/dynamicdialog';
import { ExpenseResponseModel } from 'src/app/expenses/model/expense-response.model';
import { ExpenseRequestModel } from 'src/app/expenses/model/expense-request.model';
import { ExpenseFormComponent } from 'src/app/expenses/feature/expense-form/expense-form.component';
import { ReminderModel } from 'src/app/shared/model/reminder-model';
import { ReminderType } from 'src/app/shared/enums/reminder-type';
import { AccessDirective } from 'src/app/shared/utils/access.directive';
import { user } from 'src/app/state/auth/auth.selector';
import { LineChartComponent } from 'src/app/summary/ui/line-chart/line-chart.component';
import { ExpenseService } from 'src/app/expenses/data-access/expense.service';

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
    AccessDirective,
    LineChartComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private store = inject(Store);
  private dialogService = inject(DialogService);
  private expenseService = inject(ExpenseService);
  date = new Date();

  expenses$ = this.store.select(selectCurrentMonthExpenses);
  savingInProgress$ = this.store.select(savingStatus);
  user$ = this.store.select(user);

  recentTransactions$ = this.expenses$.pipe(
    map((expenses) => expenses.slice(0, 10))
  );

  totalExpenses$ = this.expenses$.pipe(
    map((expenses) => {
      return expenses.reduce((total, current) => total + current.amount, 0);
    })
  );

  //#region chart data
  chartAspectRatio = 0.9;
  currentMonthDayOfInterval = eachDayOfInterval({
    start: startOfMonth(this.date),
    end: endOfMonth(this.date),
  });

  labels = this.currentMonthDayOfInterval.map((date) => format(date, 'd'));
  chartDataSet$ = this.expenses$.pipe(
    map((expenses) => {
      const dailyCategorizedExpenses =
        this.expenseService.dailyCategorizedExpenses(expenses);

      const data = this.currentMonthDayOfInterval.map((d) => {
        const filtered = dailyCategorizedExpenses.filter((e) =>
          isSameDay(d, new Date(e.expenseDate))
        );
        const total = filtered.reduce(
          (total, current) => total + current.total,
          0
        );
        return total;
      });
      return [
        {
          data,
          borderWidth: 2,
          minBarLength: 2,
          backgroundColor: 'rgba(177, 157, 247, 0.5)',
          borderColor: 'rgba(177, 157, 247, 0.9)',
          fill: true,
          tension: 0.2,
        },
      ];
    })
  );

  categorizedAspecRatio = 1;
  categorizedChartType = 'bar' as const;
  categorizedExpenses$ = this.expenses$.pipe(
    map((exp) => this.expenseService.categorizedExpenses(exp))
  );
  categorizedLabels$ = this.categorizedExpenses$.pipe(
    map((expenses) => expenses.map((x) => x.category))
  );
  categorizedChartData$ = this.categorizedExpenses$.pipe(
    map((expenses) => {
      return [
        {
          data: expenses.map((x) => x.total),
          fill: true,
          backgroundColor: 'rgba(177, 157, 247, 0.5)',
          borderColor: 'rgba(177, 157, 247, 0.9)',
        },
      ];
    })
  );

  //#endregion

  ngOnInit() {}

  editEntry(data: ExpenseResponseModel) {
    const expense = {
      id: data.id,
      amount: data.amount,
      categoryId: data.category?.id,
      description: data.description,
      expenseDate: data.expenseDate,
      sourceId: data.source?.id,
      tags: data.tags,
    } as ExpenseRequestModel;

    this.showExpenseModal({ title: 'Update', expense, isEdit: true });
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

    this.showExpenseModal({ title: 'Create', expense, isEdit: false });
  }

  private showExpenseModal({
    title,
    expense,
    isEdit,
  }: {
    title: 'Create' | 'Update';
    expense: ExpenseRequestModel;
    isEdit: boolean;
  }) {
    this.dialogService.open(ExpenseFormComponent, {
      width: '420px',
      header: title,
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      styleClass: 'component-dialog',
      closeOnEscape: true,
      data: {
        isDialog: true,
        isEdit,
        expense,
      },
    });
  }
}
