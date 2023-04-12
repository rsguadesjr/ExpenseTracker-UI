import { ExpenseService } from '../../data-access/expense.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Expense } from '../../model/expense.model';
import { map, take, BehaviorSubject, switchMap, of, forkJoin, Observable } from 'rxjs';
import { CalendarModule } from 'primeng/calendar';
import { ExpenseDto } from '../../model/expense-dto.model';
import { ToastService } from 'src/app/shared/utils/toast.service';
import { ValidationMessageService } from 'src/app/shared/utils/validation-message.service';
import { CategoryService } from 'src/app/shared/data-access/category.service';
import { SourceService } from 'src/app/shared/data-access/source.service';
import { Option } from 'src/app/shared/model/option.model';

@Component({
  selector: 'app-expense-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    InputTextModule,
    ButtonModule,
    CalendarModule,
  ],
  templateUrl: './expense-detail.page.component.html',
  styleUrls: ['./expense-detail.page.component.scss'],
  providers: [ExpenseService],
})
export class ExpenseDetailComponent implements OnInit {
  expenseForm!: FormGroup;

  categories = [
    {
      id: null,
      name: '',
    },
    {
      id: 1,
      name: 'Bills',
    },
    {
      id: 2,
      name: 'Foods',
    },
  ];
  fundSources = [{ id: 1, name: 'Cash' }];

  isEdit = false;
  expenseId?: string;

  loadingDetails$ = new BehaviorSubject<boolean>(false);
  categories$: Observable<Option[]>;
  sources$: Observable<Option[]>;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private expenseService: ExpenseService,
    private alertService: ToastService,
    private validationMessageService: ValidationMessageService,
    private categoryService: CategoryService,
    private sourceService: SourceService
  ) {
    this.expenseForm = new FormGroup({
      category: new FormControl(null, [Validators.required]),
      amount: new FormControl<Number>(0, [
        Validators.required,
        Validators.min(1),
      ]),
      date: new FormControl(null, Validators.required),
      description: new FormControl(null, [Validators.required]),
      source: new FormControl(),
    });

    this.isEdit =
      route.snapshot.url.length > 0 && route.snapshot.url[0]?.path == 'edit';
    if (this.isEdit) {
      this.isEdit = true;
      route.params
        .pipe(take(1))
        .pipe(
          switchMap((v) => {
            this.expenseId = v['id'];

            // TODO: navigate to home and show an error
            if (!this.expenseId) {
              this.router.navigate(['/']);
              return of();
            }

            return this.expenseService.getExpense(this.expenseId);
          })
        )
        .subscribe({
          next: (value) => {
            this.expenseForm.patchValue({
              category: { id: value.categoryId, name: value.category },
              date: new Date(value.expenseDate),
              description: value.description,
              amount: value.amount,
              source: { id: value.sourceId, name: value.source },
            });
          },
        });
    }

    this.categories$ = this.categoryService.getCategories().pipe(map(opt => [{ id: undefined, name: '' }, ...opt]));
    this.sources$ = this.sourceService.getSources().pipe(map(opt => [{ id: undefined, name: '' }, ...opt]));
  }

  ngOnInit(): void {
    // forkJoin([
    //   this.categoryService.getCategories(),
    //   this.sourceService.getSources()
    // ])
    // .pipe(

    // )
  }

  submit() {
    // clear first any visible validation message
    this.validationMessageService.clear();

    console.log('test');
    this.expenseForm.markAsDirty();
    this.expenseForm.updateValueAndValidity();

    // if invalid, show an error message
    if (this.expenseForm.invalid) {
      this.validationMessageService.showWarning('Please check incomplete details');
      return;
    }

    const expense: ExpenseDto = {
      id: this.isEdit ? this.expenseId : null,
      categoryId: this.expenseForm.get('category')?.value?.id,
      amount: +this.expenseForm.get('amount')?.value,
      expenseDate: this.expenseForm.get('date')?.value,
      description: this.expenseForm.get('description')?.value,
      sourceId: this.expenseForm.get('source')?.value?.id,
    };

    if (this.isEdit) {
      this.expenseService
        .updateExpense(this.expenseId!.toString(), expense)
        .pipe(take(1))
        .subscribe({
          next: (v) => {
            this.alertService.showSuccess('Updated expense');
            this.location.back();
          },
          error: (v) => {
            this.alertService.showError('An error occured while adding updating expense')
          }
        });
    } else {
      this.expenseService
        .createExpense(expense)
        .pipe(take(1))
        .subscribe({
          next: (v) => {
            this.alertService.showSuccess('Added new expense');
            this.location.back();
          },
          error: (v) => {
            this.alertService.showError('An error occured while adding new expense')
          }
        });
    }

    // call service here
  }

  cancel() {
    this.expenseForm.reset();
    this.location.back();
  }
}
