import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Expense } from '../../model/expense.model';
import { TotalPerCategory } from 'src/app/shared/model/total-per-category.mode';

@Component({
  selector: 'app-expense-per-category',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-per-category.component.html',
  styleUrls: ['./expense-per-category.component.scss']
})
export class ExpensePerCategoryComponent {
  totalAmount = 0;

  private _items: TotalPerCategory[] = [];
  @Input() set items(value:  TotalPerCategory[]) {
    this._items = value;
    this.totalAmount = value.reduce((val, curr) => val + curr.total, 0);
  }

  get items() {
    return this._items
  }

}
