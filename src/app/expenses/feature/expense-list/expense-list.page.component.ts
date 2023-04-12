import {
  BehaviorSubject,
  catchError,
  debounceTime,
  finalize,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { ExpenseService } from '../../data-access/expense.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormsModule,
  FormGroup,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Expense } from '../../model/expense.model';
import { ToolbarModule } from 'primeng/toolbar';
import { CalendarModule } from 'primeng/calendar';
import { PaginatorModule } from 'primeng/paginator';
import { PaginatedList } from 'src/app/shared/model/paginated-list.model';
import { ExpenseListComponent } from '../../ui/expense-list/expense-list.component';
// import { ExpenseListRoutingModule } from './expense-list-routing.module';

@Component({
  selector: 'app-expense-list-page',
  standalone: true,
  imports: [
    CommonModule,
    DataViewModule,
    ButtonModule,
    TagModule,
    FormsModule,
    ReactiveFormsModule,
    ToolbarModule,
    CalendarModule,
    PaginatorModule,
    ExpenseListComponent
  ],
  templateUrl: './expense-list.page.component.html',
  styleUrls: ['./expense-list.page.component.scss'],
})
export class ExpenseListPageComponent implements OnInit {
  products = [
    {
      id: '1000',
      code: 'f230fh0g3',
      name: 'Bamboo Watch',
      description: 'Product Description',
      image: 'bamboo-watch.jpg',
      price: 65,
      category: 'Accessories',
      quantity: 24,
      inventoryStatus: 'INSTOCK',
      rating: 5,
    },
    {
      id: '1000',
      code: 'f230fh0g3',
      name: 'Bamboo Watch',
      description: 'Product Description',
      image: 'bamboo-watch.jpg',
      price: 65,
      category: 'Accessories',
      quantity: 24,
      inventoryStatus: 'INSTOCK',
      rating: 5,
    },
  ];

  categories = [
    null,
    {
      id: 1,
      name: 'Bills',
    },
    {
      id: 2,
      name: 'Foods',
    },
  ];
  filterForm: FormGroup;
  filter$ = new Subject<any>();
  data$!: Observable<PaginatedList<Expense>>;
  filterInProgress$ = new BehaviorSubject<boolean>(false);

  rowsPerPage: number = 10;
  currentPage: number = 0;

  constructor(private router: Router, private expenseService: ExpenseService, private route: ActivatedRoute) {
    this.data$ = this.filter$.pipe(
      tap(() => this.filterInProgress$.next(true)),
      debounceTime(500),
      switchMap((filter) => expenseService.getExpenses(filter)),
      tap(() => this.filterInProgress$.next(false)),
      catchError((err) => {
        this.filterInProgress$.next(false);
        // call alert service
        return of<PaginatedList<Expense>>({ totalRows: 0, currentPage: 0, data: []})
      })
    );


    this.filterForm = new FormGroup({
      dateFrom: new FormControl(),
      dateTo: new FormControl(),
      category: new FormControl()
    });
  }

  ngOnInit(): void {

    // TODO: check this approach and remove settimeout
    this.route.queryParamMap
    .pipe( ).subscribe(x => {
      const dateFrom = x.get('dateFrom') ? new Date(Number(x.get('dateFrom'))) : null;
      const dateTo = x.get('dateTo') ? new Date(Number(x.get('dateTo'))) : null;
      console.log('[DEBUG]', { dateFrom, dateTo });
      if (!!dateFrom && !!dateTo) {
        this.filterForm.get('dateFrom')?.patchValue(dateFrom),
        this.filterForm.get('dateTo')?.patchValue(dateTo)

        setTimeout(() => {
          this.applyFilter();
        },500 )
      }
    });
  }

  getSeverity(status: string): string {
    switch (status) {
      case 'INSTOCK':
        return 'success';
      case 'LOWSTOCK':
        return 'warning';
      case 'OUTOFSTOCK':
        return 'danger';
      default:
        return '';
    }
  }

  // TODO: decide if this will be page navigation or will just open a modal
  addEntry() {
    this.router.navigate(['expenses', 'new']);
  }

  // TODO: udpate model
  editEntry(expense: any) {
    this.router.navigate(['expenses', 'edit', expense.id]);
  }

  applyFilter() {
    if (this.filterInProgress$.value) {
      return;
    }

    console.log('[DEBUG] applyFilter', this.filterForm.value);
    this.filter$.next({
      dateFrom: this.filterForm.get('dateFrom')?.value,
      dateTo: this.filterForm.get('dateTo')?.value,
      categoryId: this.filterForm.get('category')?.value?.id,
      pageNumber: this.currentPage,
      totalRows: this.rowsPerPage
    });
  }


  clearFilter() {
    this.filterForm.reset();
  }

  onPageChange(event: any) {
    console.log('[DEBUG] onPageChange', event);
    this.currentPage = event.page;
    this.rowsPerPage = event.rows;

    this.applyFilter();
  }
}
