import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { SummaryService } from '../../data-access/summary.service';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  startOfMonth,
} from 'date-fns';
import {
  BehaviorSubject,
  Subject,
  combineLatest,
  combineLatestAll,
  debounceTime,
  filter,
  finalize,
  forkJoin,
  of,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { CategoryService } from 'src/app/shared/data-access/category.service';
import { BudgetService } from 'src/app/shared/data-access/budget.service';
import { ButtonModule } from 'primeng/button';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Option } from 'src/app/shared/model/option.model';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { MessagesModule } from 'primeng/messages';
import { Message } from 'primeng/api';
@Component({
  selector: 'app-summary.page',
  standalone: true,
  imports: [
    CommonModule,
    ChartModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    CalendarModule,
    MessagesModule
  ],
  templateUrl: './summary.page.component.html',
  styleUrls: ['./summary.page.component.scss'],
})
export class SummaryComponent implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject<void>();

  chartData: any;
  chartOptions: any;

  summaryService = inject(SummaryService);
  categoryService = inject(CategoryService);
  budgetService = inject(BudgetService);

  categories$ = this.categoryService.getCategories();

  form: FormGroup;
  dateViewOptions: Option[] = [
    { id: null, name: '' },
    { id: 'month', name: 'Month' },
    { id: 'custom', name: 'Custom Range' },
  ];

  monthOptions: Option[] = [{ id: null, name: '' }];
  filter$ = new BehaviorSubject<{
    view: string;
    startDate: Date;
    endDate: Date;
  } | null>(null);
  filterInProgress: boolean = false;

  messages: Message[] = [];
  validationErrors: { [key: string]: string[] } = {};

  constructor() {
    this.form = new FormGroup({
      view: new FormControl(),
      monthRange: new FormControl(),
      startDate: new FormControl(),
      endDate: new FormControl(),
      category: new FormControl()
    });

    this.setupDefaultMonthOptions();


  }

  ngOnInit() {
    this.budgetService.initBudgets();

    this.filter$
      .pipe(
        filter((f) => !!f),
        switchMap((filter) => {
          const startDate = filter?.startDate.toISOString();
          const endDate = filter?.endDate.toISOString();
          return combineLatest([
            this.categoryService.getCategories(),
            this.budgetService.getBudgets(),
            this.summaryService.getTotalAmountPerCategoryPerDate(
              startDate!,
              endDate!
            ),
            of(filter),
          ]);
        }),
        tap(() => (this.filterInProgress = false)),
        takeUntil(this.ngUnsubscribe$)
      )
      .subscribe(([categories, budgets, result, filter]) => {
        console.log('[DEBUG] ', { categories, budgets, result });
        categories = categories.filter((x) => x.isActive);
        const barRGB = categories.map((c) => {
          const r = Math.ceil(Math.random() * 255);
          const g = Math.ceil(Math.random() * 255);
          const b = Math.ceil(Math.random() * 255);
          return { categoryId: c.id, r, g, b };
        });

        const dates = eachDayOfInterval({
          start: filter?.startDate ?? new Date(),
          end: filter?.endDate ?? new Date(),
        });
        const datasets = categories.map((c) => {
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

          const rgb = barRGB.find((x) => x.categoryId == c.id) ?? {
            r: 0,
            g: 0,
            b: 0,
          };
          return {
            label: c.name,
            data,
            backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`,
            borderColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
            borderWidth: 1,
          };
        });
        const labels = dates.map((x) => format(x, 'd'));

        // this.basicData.labels = labels;
        // this.basicData.datasets = dataSets;
        console.log('[DEBUG]', { labels, datasets });

        this.chartData = {
          labels,
          datasets,
        };
      });



      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--text-color');
      const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
      const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

      this.chartOptions = {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            x: {
              // stacked: true,
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
              // stacked: true,
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            }
        }
      };
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  applyFilter() {
    if (!this.form.value.view) return;

    if (this.form.value.view === 'month') {
      if (this.form.value.monthRange) {
        this.filterInProgress = true;

        const dateRange = this.form.value.monthRange;
        this.filter$.next({ view: this.form.value.view, ...dateRange });
      }
      // show a message to required this option
      else {
        this.messages = [
          {
            severity: 'info',
            detail: 'Please select a value from the "Month" dropdown option',
          },
        ];
      }
    } else if (this.form.value.view === 'custom') {
      if (this.form.value.startDate && this.form.value.endDate) {
        this.filterInProgress = true;

        const dateRange = {
          startDate: this.form.value.startDate,
          endDate: this.form.value.endDate,
        };
        this.filter$.next({ view: this.form.value.view, ...dateRange });
      }
      // show a message to required this option
      else {
        this.messages = [
          {
            severity: 'info',
            detail: 'Please provide a valid value form "Date From" and "Date To" date picker fields',
          },
        ];
      }
    }
  }

  clearFilter() {
    this.filterInProgress = false;
  }

  // last 8 months
  setupDefaultMonthOptions() {
    const monthsCounter = new Array(10).fill(0);
    const currentDate = new Date();
    monthsCounter.forEach((_, i) => {
      console.log('[DEBUG]', i);
      const month = addMonths(currentDate, -i);

      const option: Option = {
        id: { startDate: startOfMonth(month), endDate: endOfMonth(month) },
        name: format(month, 'MMM-yyyy'),
      };
      this.monthOptions.push(option);
    });
  }
}
