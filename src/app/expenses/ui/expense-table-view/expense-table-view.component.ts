import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Expense } from '../../model/expense.model';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-expense-table-view',
  standalone: true,
  imports: [CommonModule,TableModule,ButtonModule,PaginatorModule],
  templateUrl: './expense-table-view.component.html',
  styleUrls: ['./expense-table-view.component.scss']
})
export class ExpenseTableViewComponent {

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
  @Output('onPageChange') pageChange = new EventEmitter<any>();
  @Output() selected = new EventEmitter<Expense>();


  editEntry(item: Expense) {
    this.selected.emit(item);
  }


  onPageChange(event: any) {
    this.pageChange.emit(event);
  }
}
