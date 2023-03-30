import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
// import { ExpenseListRoutingModule } from './expense-list-routing.module';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.scss'],
})
export class ExpenseListComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
