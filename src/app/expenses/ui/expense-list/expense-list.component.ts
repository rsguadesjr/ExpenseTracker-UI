import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { Expense } from '../../model/expense.model';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, PaginatorModule, ButtonModule],
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.scss'],
})
export class ExpenseListComponent {
  @Input() items: Expense[] = [];

  _totalRows!: number;
  @Input() set totalRows(value: number) {
    this._totalRows = value ?? this.items.length;
  }
  get totalRows() {
    return this._totalRows;
  }

  _rowsPerPage!: number;
  @Input() set rowsPerPage(value: number) {
    this._rowsPerPage = value ?? 10;
  }
  get rowsPerPage() {
    return this._rowsPerPage;
  }

  @Input() hidePagination = false;
  @Output() selected = new EventEmitter<Expense>();
  @Output('onPageChange') pageChange = new EventEmitter<any>();

  editEntry(expense: any) {
    console.log('editEntry 1', expense)
    this.selected.emit(expense);
  }

  onPageChange(event: any) {
    this.pageChange.emit(event);
  }
}
