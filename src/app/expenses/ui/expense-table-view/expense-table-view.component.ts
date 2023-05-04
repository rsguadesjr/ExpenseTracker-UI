import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Expense } from '../../model/expense.model';
import { PaginatorModule } from 'primeng/paginator';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-expense-table-view',
  standalone: true,
  imports: [CommonModule,TableModule,ButtonModule,PaginatorModule,MultiSelectModule],
  templateUrl: './expense-table-view.component.html',
  styleUrls: ['./expense-table-view.component.scss']
})
export class ExpenseTableViewComponent {

  categories: string[] = [];
  sources: string[] = [];

  private _items:Expense[] = [];
  @Input() set items(value: Expense[]) {
    this._items = value ?? [];

    const categories = this._items.map(x => x.category) as string[];
    this.categories = Array.from(new Set(categories));

    const sources = this._items.map(x => x.source) as string[];
    this.sources = Array.from(new Set(sources));
  }
  get items() {
    return this._items;
  }

  @Output() selected = new EventEmitter<Expense>();
  @Output() delete = new EventEmitter<Expense>();


  editEntry(item: Expense) {
    this.selected.emit(item);
  }

  deleteEntry(item: Expense) {
    this.delete.emit(item);
  }
}
