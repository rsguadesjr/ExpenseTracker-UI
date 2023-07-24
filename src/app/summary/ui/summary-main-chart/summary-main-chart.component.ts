import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { SummaryFilter } from '../../model/summary-filter.model';
import { CategoryResponseModel } from 'src/app/shared/model/category-response.model';
import { BudgetResult } from 'src/app/shared/model/budget-result';
import { TotalAmountPerCategoryPerDate } from '../../model/total-amount-per-category-per-date';
import { format, isSameMonth, eachDayOfInterval, isSameDay, getDaysInMonth } from 'date-fns';
import { ChartData } from '../../model/chart-data';

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


    let result = value?.data ?? [];
    let budgets = value.budgets ?? [];
    const filter = value.filter;
    const categories = value.categories?.filter(
          (x) =>
            x.isActive &&
            (filter?.categoryIds?.length === 0 ||
              filter?.categoryIds?.includes(x.id))
        ) ?? [];
    const colors = this.getRGB(value.categories.length);

    if (value.categories.length > 0) {
      result = result.filter(x => categories.findIndex(y => y.id == x.categoryId) != -1);
    }

    let labels: string[] = [];
    let dataSets: any[] = [];
    let dates: Date[] = [];
    let compare: (dateLeft: Date, dateRight: Date) => boolean;


    if (filter?.view === 'annual') {
      // for annual, breakdown only to months
      compare = (date1, date2) => isSameMonth(date1, date2);
      const year = +format(filter.startDate, 'yyyy');
      dates = new Array(12).fill(0).map((_,i)=> new Date(year, i));
      labels = dates.map(date => format(date, 'MMM'));
    }
    else {
      compare = (date1, date2) => isSameDay(date1, date2);
      dates = eachDayOfInterval({
        start: filter?.startDate ?? new Date(),
        end: filter?.endDate ?? new Date(),
      });
      labels = dates.map(date => format(date, 'd'));
    }


    // let categorized = false;
    let groupings = filter.breakdown ? categories.map(x => ({ id: x.id, name: x.name })) : [{ id: null, name: 'Total' }];

    // group or categorized the data
    let groupedData = groupings.map(group => {
      // data per category/group
      const perGroupData = result.filter((x) => !group.id || x.categoryId == group.id);
      // total per date
      const data = dates.map((date) => {
          const currentDateResult = perGroupData.filter((x) => compare(new Date(x.expenseDate), date));
          const total = currentDateResult.reduce((total, curr) => total + curr.total, 0);
          return { date, total }
      });

      return  { ...group, data }
    });

    // convert the grouped/categorized data into datasets
    dataSets = groupedData.map((gd, i) => {
      const rgb = colors[i];
      return {
        type: this.type,
        label: gd.name,
        backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5`,
        borderColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        data: gd.data.map(d => d.total),
        borderWidth: 2,
        minBarLength: 3,
      }
    })


    const defaultBudget = budgets.find((x) => x.month === -1 && x.year === -1);
    // group or categorized the data
    let budgetGroupData = groupings.map(group => {
      // total per date
      const data = dates.map((date) => {
          let month = +format(date, 'M');
          let year = +format(date, 'yyyy');
          let budget = budgets.find(x => x.month == month && (x.year == year || x.year == -1))
                          ?? defaultBudget;
          let defaultBudgetAmount = budget?.amount ?? 0;

          // if categories are selected, then get the total from the categorized budget instead of total budget
          if (categories.length > 0 && categories.length < value.categories.length) {
            defaultBudgetAmount = budget?.budgetCategories
                                    .filter(x => categories.findIndex(y => y.id == x.categoryId) != -1)
                                    .reduce((total, current) => total + current.amount, 0) ?? 0;
          }


          let bc = budget?.budgetCategories.find(bc => bc.categoryId == group.id);
          let budgetLimit = bc?.amount ?? defaultBudgetAmount;


          let total: number;

          if (filter?.view === 'annual') {
            total = budgetLimit;
          }
          else {
            let newDate = new Date(year, month );
            let daysInMonth = getDaysInMonth(newDate);
            total = budgetLimit/daysInMonth;
          }

          return { date, total }
      });

      return  { ...group, data }
    });

    let budgetDataSets = budgetGroupData.map((gd, i) => {
      const r = Math.ceil(Math.random() * 255);
      const g = Math.ceil(Math.random() * 255);
      const b = Math.ceil(Math.random() * 255);
      const rgb = { r, g,b };
      return {
        type: 'line',
        fill: true,
        label: `${gd.name} (Budget)`,
        backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
        borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
        data: gd.data.map(d => d.total),
        borderWidth: 1,
        minBarLength: 3,
      }
    })


    this.data = {
      labels,
      datasets: [...dataSets, ...budgetDataSets],
    };
  }

  @Input() type: 'bar' | 'line' | 'pie' = 'bar';
  @Input() aspectRatio: number | undefined;
  @Input() showLegend: boolean = true;

  constructor() {
  }

  ngOnInit() {

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.options = {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: this.aspectRatio,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
          display: this.showLegend
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
      'onClick' : function (event: any, elements: any, chart: any) {
        if (elements[0]) {
           const i = elements[0].index;
        }
      }
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


  getChartData(result: TotalAmountPerCategoryPerDate[],
              filter: SummaryFilter,
              categories: CategoryResponseModel[],
              labelFormat = 'd',
              dateCompratorFn: Function) {
    const dates = eachDayOfInterval({
      start: filter?.startDate ?? new Date(),
      end: filter?.endDate ?? new Date(),
    });
    const colors = this.getRGB(categories.length);
    const labels = dates.map((x) => format(x, labelFormat));
    const datasets = categories.map((c, i) => {
      const perCategoryData = result.filter((x) => x.categoryId == c.id);
      const data = dates.map((date) => {
        const currentDateResult = perCategoryData.filter((x) =>
          dateCompratorFn(new Date(x.expenseDate), date)
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
  }
}
