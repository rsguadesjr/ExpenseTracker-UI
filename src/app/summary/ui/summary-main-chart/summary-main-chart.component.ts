import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { SummaryFilter } from '../../model/summary-filter.model';
import { CategoryResponseModel } from 'src/app/shared/model/category-response.model';
import { BudgetResult } from 'src/app/shared/model/budget-result';
import { TotalAmountPerCategoryPerDate } from '../../model/total-amount-per-category-per-date';
import { format, isSameMonth, eachDayOfInterval, isSameDay } from 'date-fns';

@Component({
  selector: 'app-summary-main-chart',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './summary-main-chart.component.html',
  styleUrls: ['./summary-main-chart.component.scss'],
})
export class SummaryMainChartComponent {
  data: any;
  options: any;

  @Input() set chartFilterData(
    value: {
      categories: CategoryResponseModel[];
      budgets: BudgetResult[];
      data: TotalAmountPerCategoryPerDate[];
      filter: SummaryFilter | null;
    } | null
  ) {
    if (!value || !value.filter) return;


    const result = value?.data ?? [];
    const budgets = value.budgets ?? [];
    const filter = value.filter;
    const categories = value.categories?.filter(
        (x) =>
          x.isActive &&
          (filter?.categoryIds?.length === 0 ||
            filter?.categoryIds?.includes(x.id))
      ) ?? [];
    const colors = this.getRGB(categories.length);

    let labels: string[] = [];
    let datasets: any[] = [];

    // annual
    if (filter?.view === 'annual') {
      const year = +format(filter.startDate, 'yyyy');
      const monthlyDates = new Array(12)
        .fill(0)
        .map((_, i) => new Date(year, i));

      labels = monthlyDates.map((x) => format(x, 'MMM'));
      datasets = categories.map((c, i) => {
        const perCategoryData = result.filter((x) => x.categoryId == c.id);
        const data = monthlyDates.map((date) => {
          const currentDateResult = perCategoryData.filter((x) =>
            isSameMonth(new Date(x.expenseDate), date)
          );
          const totalPerDate = currentDateResult.reduce(
            (total, curr) => total + curr.total,
            0
          );
          return totalPerDate;
        });

        const rgb = colors[i];

        // dataset
        return {
          type: 'bar',
          label: c.name,
          data,
          backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5`,
          borderColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
          borderWidth: 1,
          minBarLength: 5,
        };
      });


      // get the default budget
      let defaultBudget = budgets.find((x) => x.year === -1);
      let budgetDatasets: any[] = [];

      if (!filter?.categoryIds || filter.categoryIds.length != categories.length) {
        const data = monthlyDates.map((date) => {
          const monthlyBudget = budgets
            .filter((x) => x.id != defaultBudget?.id)
            .find(
              (x) =>
                (x.year == +format(date, 'yyyy') || x.year === -1) &&
                x.month == +format(date, 'M')
            );
          const budget = monthlyBudget ?? defaultBudget;
          return budget?.amount ?? 0;
        });
        budgetDatasets = [
          {
            type: 'line',
            fill: true,
            label: 'Budget',
            data: data,
            backgroundColor: `rgb(87 87 87 / 20%)`,
            borderColor: `rgb(87 87 87 )`,
            borderWidth: 1,
            minBarLength: 5,
          },
        ];
      } else {
        budgetDatasets = categories.map((category) => {
          const data = monthlyDates.map((date) => {
            const monthlyBudget = budgets
              .filter((x) => x.id != defaultBudget?.id)
              .find(
                (x) =>
                  (x.year == +format(date, 'yyyy') || x.year === -1) &&
                  x.month == +format(date, 'M')
              );
            const budget =
              monthlyBudget?.budgetCategories.find(
                (x) => x.categoryId == category.id
              ) ??
              defaultBudget?.budgetCategories.find(
                (x) => x.categoryId == category.id
              );
            return budget?.amount ?? 0;
          });

          const r = Math.ceil(Math.random() * 255);
          const g = Math.ceil(Math.random() * 255);
          const b = Math.ceil(Math.random() * 255);
          return {
            type: 'line',
            fill: true,
            label: `Budget(${category?.name})`,
            data: data,
            backgroundColor: `rgb(${r} ${g} ${b} / 20%)`,
            borderColor: `rgb(${r} ${g} ${b} )`,
            borderWidth: 1,
            minBarLength: 5,
          };
        });
      }

      this.data = {
        labels,
        datasets: [...datasets, ...budgetDatasets],
      };

      return;
    }
    else {
      const dates = eachDayOfInterval({
        start: filter?.startDate ?? new Date(),
        end: filter?.endDate ?? new Date(),
      });

      labels = dates.map((x) => format(x, 'd'));
      datasets = categories.map((c, i) => {
        const perCategoryData = result.filter((x) => x.categoryId == c.id);
        const data = dates.map((date) => {
          const currentDateResult = perCategoryData.filter((x) =>
            isSameDay(new Date(x.expenseDate), date)
          );
          const totalPerDate = currentDateResult.reduce(
            (total, curr) => total + curr.total,
            0
          );
          return totalPerDate;
        });

        const rgb = colors[i];

        // dataset
        return {
          type: 'bar',
          label: c.name,
          data,
          backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5`,
          borderColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
          borderWidth: 1,
          minBarLength: 5,
        };
      });

      // get the default budget
      let defaultBudget = budgets.find((x) => x.month === -1 && x.year === -1);
      let budgetDatasets: any[] = [];
      if (
        !filter?.categoryIds ||
        filter.categoryIds.length != categories.length
      ) {
        const data = dates.map((date) => {
          const monthlyBudget = budgets
            .filter((x) => x.id != defaultBudget?.id)
            .find(
              (x) =>
                (x.year == +format(date, 'yyyy') || x.year === -1) &&
                x.month == +format(date, 'M')
            );
          const budget = monthlyBudget ?? defaultBudget;
          return !budget?.amount ? 0 : budget.amount / dates.length;
        });
        budgetDatasets = [
          {
            type: 'line',
            fill: true,
            label: 'Budget',
            data: data,
            backgroundColor: `rgb(87 87 87 / 20%)`,
            borderColor: `rgb(87 87 87 )`,
            borderWidth: 1,
            minBarLength: 5,
          },
        ];
      } else {
        budgetDatasets = filter.categoryIds.map((id) => {
          const data = dates.map((date) => {
            const monthlyBudget = budgets
              .filter((x) => x.id != defaultBudget?.id)
              .find(
                (x) =>
                  (x.year == +format(date, 'yyyy') || x.year === -1) &&
                  x.month == +format(date, 'M')
              );
            const budget =
              monthlyBudget?.budgetCategories.find((x) => x.categoryId == id) ??
              defaultBudget?.budgetCategories.find((x) => x.categoryId == id);
            return !budget?.amount ? 0 : budget.amount / dates.length;
          });

          const category = categories.find((x) => x.id == id);
          const r = Math.ceil(Math.random() * 255);
          const g = Math.ceil(Math.random() * 255);
          const b = Math.ceil(Math.random() * 255);
          return {
            type: 'line',
            fill: true,
            label: `Budget(${category?.name})`,
            data: data,
            backgroundColor: `rgb(${r} ${g} ${b} / 20%)`,
            borderColor: `rgb(${r} ${g} ${b} )`,
            borderWidth: 1,
            minBarLength: 5,
          };
        });
      }

      this.data = {
        labels,
        datasets: [...datasets, ...budgetDatasets],
      };
    }

  }

  @Input() type: 'bar' | 'line' = 'bar';

  constructor() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.options = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          // stacked: true,
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
        },
        y: {
          // stacked: true,
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
        },
      },
    };
  }


  getBudgetDataset() {

  }

  getRGB(total: number) {
    if (!total || total <= 0) return [];

    const rgb = (r: number, g: number, b: number) => ({ r, g, b });
    const defaultColors = [
      rgb(0, 0, 255),
      rgb(0, 255, 0),
      rgb(255, 0, 0),
      rgb(255, 255, 0),
      rgb(0, 255, 255),
      rgb(255, 0, 255),
      rgb(128, 128, 128),
      rgb(255, 69, 0),
      rgb(240, 230, 140),
      rgb(139, 69, 19),
    ];

    if (total <= defaultColors.length) {
      return defaultColors.slice(0, 8);
    } else {
      // get the remaining count to generate random color
      const diff = total - defaultColors.length;

      return new Array(diff).fill(0).map((c) => {
        const r = Math.ceil(Math.random() * 255);
        const g = Math.ceil(Math.random() * 255);
        const b = Math.ceil(Math.random() * 255);
        return rgb(r, g, b);
      });
    }
  }
}
