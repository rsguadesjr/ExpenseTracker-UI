import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Expense } from '../../model/expense.model';
import { TotalPerCategory } from 'src/app/shared/model/total-per-category.mode';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-expense-per-category',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './expense-per-category.component.html',
  styleUrls: ['./expense-per-category.component.scss'],
})
export class ExpensePerCategoryComponent {
  totalAmount = 0;
  @Input() hideTotal = false;

  private _items: TotalPerCategory[] = [];
  @Input() set items(value: TotalPerCategory[]) {
    this._items = value;
    this.totalAmount = value.reduce((val, curr) => val + curr.total, 0);
    this.setupChart();
  }

  get items() {
    return this._items;
  }

  data: any;
  options: any;


  setupChart() {const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    const rgb = this.items.map((x) => {
      const r = Math.ceil(Math.random() * 255);
      const g = Math.ceil(Math.random() * 255);
      const b = Math.ceil(Math.random() * 255);
      return { r, g, b };
    });
    this.data = {
      labels: this.items.map((x) => x.category),
      datasets: [
        {
          label: 'Total',
          data: this.items.map((x) => x.total),
          backgroundColor: rgb.map((x) => `rgba(${x.r}, ${x.g}, ${x.b}, 0.2)`),
          borderColor: rgb.map((x) => `rgb(${x.r}, ${x.g}, ${x.b})`),
          borderWidth: 1,
        },
      ],
    };

    // this.data = {
    //   labels: ['A', 'B', 'C'],
    //   datasets: [
    //     {
    //       data: [300, 50, 100],
    //       backgroundColor: [
    //         documentStyle.getPropertyValue('--blue-500'),
    //         documentStyle.getPropertyValue('--yellow-500'),
    //         documentStyle.getPropertyValue('--green-500'),
    //       ],
    //       hoverBackgroundColor: [
    //         documentStyle.getPropertyValue('--blue-400'),
    //         documentStyle.getPropertyValue('--yellow-400'),
    //         documentStyle.getPropertyValue('--green-400'),
    //       ],
    //     },
    //   ],
    // };

    this.options = {
      cutout: '60%',
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
    };
  }

  constructor() {

  }


}
