import { CategoryResponseModel } from 'src/app/shared/model/category-response.model';
import { SummaryFilter } from './summary-filter.model';
import { TotalAmountPerCategoryPerDate } from './total-amount-per-category-per-date';
import isSameMonth from 'date-fns/isSameMonth';
import isSameDay from 'date-fns/isSameDay';
import { format } from 'date-fns';

export class ChartData {
  public result: TotalAmountPerCategoryPerDate[] = [];
  public filter?: SummaryFilter;
  public categories: CategoryResponseModel[] = [];
  public labelFormat: string = 'd';
  public dateCompratorFn: (dateLeft: Date, dateRight: Date) => boolean;
  public dates: Date[] = [];

  constructor() {
    this.dateCompratorFn = isSameDay;
  }

  getChartData() {
    const labels = this.dates.map((date) => format(date, this.labelFormat));
    const datasets = this.categories.map((c, i) => {
      const perCategoryData = this.result.filter((x) => x.categoryId == c.id);
      const data = this.dates.map((date) => {
        const currentDateResult = perCategoryData.filter((x) =>
          this.dateCompratorFn(new Date(x.expenseDate), date)
        );
        const totalPerDate = currentDateResult.reduce(
          (total, curr) => total + curr.total,
          0
        );
        return totalPerDate;
      });

      const rgb = this.colors[i];

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

    return {
      labels,
      datasets,
    };
  }

  private get colors() {
    return this.getRGB(this.categories.length);
  }

  private getRGB(total: number) {
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
