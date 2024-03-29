import { Component, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { CategoryService } from 'src/app/shared/data-access/category.service';
import { Observable, map, take } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { SettingsBudgetFormComponent } from '../settings-budget-form/settings-budget-form.component';
import { BudgetService } from 'src/app/shared/data-access/budget.service';
import { DataTableComponent } from 'src/app/shared/feature/data-table/data-table.component';
import { DataTableColumn } from 'src/app/shared/model/data-table-column';
import { BudgetResult } from 'src/app/shared/model/budget-result';
import { format } from 'date-fns';
import { ConfirmationService } from 'primeng/api';
import { ToastService } from 'src/app/shared/utils/toast.service';
import { AccessDirective } from 'src/app/shared/utils/access.directive';

@Component({
  selector: 'app-settings-budget',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DataTableComponent,
    AccessDirective
  ],
  templateUrl: './settings-budget.component.html',
  styleUrls: ['./settings-budget.component.scss'],
  providers: [DecimalPipe]
})
export class SettingsBudgetComponent {
  budgetService = inject(BudgetService);
  dialogService = inject(DialogService);
  confirmationService = inject(ConfirmationService);
  toastService = inject(ToastService);
  decimalPipe = inject(DecimalPipe);

  monthlyBudget = [
    { month: -1, year: -1, budget: 0 },
  ]
  columns: DataTableColumn[] = [
    { header: 'Month', field: 'monthText' },
    { header: 'Year', field: 'yearText' },
    { header: 'Amount', field: 'amount', formatValue: (value) => {
      if (value.amount)
        return this.decimalPipe.transform(value.amount, '') || '0';

      return '0'
    } },
    { header: 'Status', field: 'isActive', formatValue: (value) => value.isActive ? 'Active' : 'Inactive' }
  ];


  budgets$: Observable<BudgetResult[] & { monthText: string, yearText: string }[]> = this.budgetService.getBudgets().pipe(
    map((x) => x.map(r => ({
      ...r,
      monthText: r.month == -1 ? 'All' : format(new Date(new Date().getFullYear(), +r.month-1), 'MMMM'),
      yearText: r.year == -1 ? 'All' : r.year?.toString()
    })))
  );


  onEdit(item: any) {
    this.dialogService.open(SettingsBudgetFormComponent, {
      width: '420px',
      header: 'Update',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      styleClass: 'component-dialog',
      closeOnEscape: true,
      data: {
        ...item
      },
    });
  }

  onCreate() {
    this.dialogService.open(SettingsBudgetFormComponent, {
      width: '420px',
      header: 'Create',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      styleClass: 'component-dialog',
      closeOnEscape: true,
      data: {
        isActive: true
      },

    });
  }

  onDelete(item: BudgetResult & { monthText: string, yearText: string }) {
    const message = ['Do you want to delete this entry?',
                    `Amount: ${item.amount}`,
                    `Month: ${item.monthText}`,
                    `Year: ${item.yearText}`
                    ]
    this.confirmationService.confirm({
        message: message.join('<br/>'),
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            this.budgetService.delete(item.id!)
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

}
