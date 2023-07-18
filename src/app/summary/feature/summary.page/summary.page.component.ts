import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { SummaryService } from '../../data-access/summary.service';
import {
  addMonths,
  addYears,
  differenceInMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfYear,
  format,
  isSameDay,
  isSameMonth,
  monthsInYear,
  startOfMonth,
  startOfYear,
} from 'date-fns';
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  combineLatestAll,
  debounceTime,
  filter,
  finalize,
  forkJoin,
  map,
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
import { MultiSelectModule } from 'primeng/multiselect';
import { SummaryMainChartComponent } from '../../ui/summary-main-chart/summary-main-chart.component';
import { SummaryFilter } from '../../model/summary-filter.model';
import { BudgetResult } from 'src/app/shared/model/budget-result';
import { CategoryResponseModel } from 'src/app/shared/model/category-response.model';
import { TotalAmountPerCategoryPerDate } from '../../model/total-amount-per-category-per-date';
import { InputSwitchModule } from 'primeng/inputswitch';
@Component({
  selector: 'app-summary.page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    CalendarModule,
    MessagesModule,
    MultiSelectModule,
    SummaryMainChartComponent,
    InputSwitchModule
  ],
  templateUrl: './summary.page.component.html',
  styleUrls: ['./summary.page.component.scss'],
})
export class SummaryComponent implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject<void>();

  chartData$?: Observable<{ categories: CategoryResponseModel[], budgets: BudgetResult[], data: TotalAmountPerCategoryPerDate[], filter: SummaryFilter | null}>;
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
    { id: 'annual', name: 'Annual' },
    { id: 'custom', name: 'Custom Range' },
  ];

  monthOptions: Option[] = [{ id: null, name: '' }];
  yearOptions: Option[] = [{ id: null, name: '' }];
  filter$ = new BehaviorSubject<SummaryFilter | null>(null);
  filterInProgress: boolean = false;

  messages: Message[] = [];
  validationErrors: { [key: string]: string[] } = {};

  constructor() {
    this.form = new FormGroup({
      view: new FormControl(),
      month: new FormControl(),
      year: new FormControl(),
      startDate: new FormControl(),
      endDate: new FormControl(),
      category: new FormControl(),
      breakdown: new FormControl()
    });

    this.setupDefaultMonthOptions();
    this.setupDefaultYearOptions();

  }

  ngOnInit() {
    this.budgetService.initBudgets();


    this.chartData$ = this.filter$
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
        map(([categories, budgets, data, filter]) => ({ categories, budgets, data, filter })),
        tap(() => (this.filterInProgress = false)),
        takeUntil(this.ngUnsubscribe$)
      );
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  applyFilter() {
    if (!this.form.value.view) return;

    if (this.form.value.view === 'month') {
      if (this.form.value.month) {
        this.filterInProgress = true;

        const dateRange = this.form.value.month;
        this.filter$.next({ view: this.form.value.view,
                            categoryIds: this.form.value.category ?? [],
                            ...dateRange,
                            breakdown: this.form.value.breakdown });
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
    }
    else if (this.form.value.view === 'custom') {
      if (this.form.value.startDate && this.form.value.endDate) {
        this.filterInProgress = true;

        const dateRange = {
          startDate: this.form.value.startDate,
          endDate: this.form.value.endDate,
        };
        this.filter$.next({ view: this.form.value.view, categoryIds: this.form.value.category ?? [], ...dateRange, breakdown: this.form.value.breakdown });
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
    else if (this.form.value.view === 'annual') {
      if (this.form.value.year) {
        this.filterInProgress = true;

        const dateRange = this.form.value.year;
        this.filter$.next({ view: this.form.value.view, categoryIds: this.form.value.category ?? [], ...dateRange, breakdown: this.form.value.breakdown  });
      }
      // show a message to required this option
      else {
        this.messages = [
          {
            severity: 'info',
            detail: 'Please select a value from the "Year" dropdown option',
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
      const month = addMonths(currentDate, -i);

      const option: Option = {
        id: { startDate: startOfMonth(month), endDate: endOfMonth(month) },
        name: format(month, 'MMM-yyyy'),
      };
      this.monthOptions.push(option);
    });
  }


  setupDefaultYearOptions() {
    const yearsCounter = new Array(5).fill(0);
    const currentDate = new Date();
    yearsCounter.forEach((_, i) => {
      const year = addYears(currentDate, -i);

      const option: Option = {
        id: { startDate: startOfYear(year), endDate: endOfYear(year) },
        name: format(year, 'yyyy'),
      };
      this.yearOptions.push(option);
    });
  }

}
