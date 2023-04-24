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
  @Output() selected = new EventEmitter<Expense>();


  editEntry(item: Expense) {
    this.selected.emit(item);
  }
}
