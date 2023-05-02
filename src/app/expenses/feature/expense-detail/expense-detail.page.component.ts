import { ExpenseService } from '../../data-access/expense.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, Optional } from '@angular/core';
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
import { startOfDay } from 'date-fns';
import { CardModule } from 'primeng/card';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

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
    CardModule
  ],
  templateUrl: './expense-detail.page.component.html',
  styleUrls: ['./expense-detail.page.component.scss'],
  providers: [],
})
export class ExpenseDetailComponent implements OnInit {
  expenseForm!: FormGroup;

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
    private sourceService: SourceService,
    @Optional() public dialogConfig: DynamicDialogConfig,
    @Optional() private dialogRef: DynamicDialogRef
  ) {
    this.expenseForm = new FormGroup({
      category: new FormControl(null, [Validators.required]),
      amount: new FormControl<Number | null>(null, [
        Validators.required,
        Validators.min(1),
      ]),
      date: new FormControl(startOfDay(new Date()), Validators.required),
      description: new FormControl(null, [Validators.required]),
      source: new FormControl({ id: 1, name: 'Cash' }, [Validators.required]),
    });

    console.log('[DEBUG] dialogConfig', dialogConfig)
    let expenseId$: Observable<string>;
    if (dialogConfig) {
      this.isEdit = dialogConfig.data.isEdit;
      expenseId$ = of(dialogConfig.data.id);
    } else {
      this.isEdit = (route.snapshot.url.length > 0 && route.snapshot.url[0]?.path == 'edit');
      expenseId$ = route.params.pipe(
        map(x => x['id'])
      );
    }


    if (this.isEdit) {
      expenseId$
        .pipe(take(1))
        .pipe(
          switchMap((id) => {
            console.log('[DEBUG] dialogConfig 2', id)
            this.expenseId = id;

            if (!this.expenseId) {
              if (dialogRef)
                dialogRef.close();
              else
                this.router.navigate(['/']);

              return of();
            }

            return this.expenseService.getExpense(this.expenseId);
          })
        )
        .subscribe({
          next: (value) => {
            if (value) {
              this.expenseForm.patchValue({
                category: { id: value.categoryId, name: value.category },
                date: new Date(value.expenseDate),
                description: value.description,
                amount: value.amount,
                source: { id: value.sourceId, name: value.source },
              });
            }
          },
          error: (error) => {
            console.log('[DEBUG] error', error)
          }
        });
    }

    this.categories$ = this.categoryService.getCategories().pipe(map(opt => [{ id: undefined, name: '' }, ...opt]));
    this.sources$ = this.sourceService.getSources().pipe(map(opt => [{ id: undefined, name: '' }, ...opt]));
  }

  ngOnInit() {}

  submit() {
    // clear first any visible validation message
    this.validationMessageService.clear();

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
            if (this.dialogRef) {
              this.dialogRef.close();
            } else {
              this.location.back();
            }
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
            if (this.dialogRef) {
              this.dialogRef.close();
            } else {
              this.location.back();
            }
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

    if (this.dialogRef)
      this.dialogRef.close();
    else
      this.location.back();
  }
}
