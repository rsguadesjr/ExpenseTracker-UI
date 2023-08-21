import { ExpenseService } from '../../data-access/expense.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { Component, OnDestroy, OnInit, Optional, inject } from '@angular/core';
import {
  FormBuilder,
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
import {
  map,
  take,
  BehaviorSubject,
  switchMap,
  of,
  forkJoin,
  Observable,
  takeUntil,
  Subject,
  combineLatest,
  skip,
} from 'rxjs';
import { CalendarModule } from 'primeng/calendar';
import { ExpenseDto } from '../../model/expense-dto.model';
import { ToastService } from 'src/app/shared/utils/toast.service';
import { ValidationMessageService } from 'src/app/shared/utils/validation-message.service';
import { CategoryService } from 'src/app/shared/data-access/category.service';
import { SourceService } from 'src/app/shared/data-access/source.service';
import { Option } from 'src/app/shared/model/option.model';
import { parseISO, startOfDay } from 'date-fns';
import { CardModule } from 'primeng/card';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ChipsModule } from 'primeng/chips';
import { MessagesModule } from 'primeng/messages';
import { Message } from 'primeng/api';
import { FormValidation } from 'src/app/shared/utils/form-validation';
import { InputNumberModule } from 'primeng/inputnumber';
import { Store } from '@ngrx/store';
import {
  addExpense,
  updateExpense,
} from 'src/app/state/expenses/expenses.action';
import { savingStatus } from 'src/app/state/expenses/expenses.selector';

@Component({
  selector: 'app-expense-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    CalendarModule,
    CardModule,
    ChipsModule,
    MessagesModule,
  ],
  templateUrl: './expense-detail.component.html',
  styleUrls: ['./expense-detail.component.scss'],
  providers: [],
})
export class ExpenseDetailComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<unknown>();
  private store = inject(Store);
  private categoryService = inject(CategoryService);
  private sourceService = inject(SourceService);
  private dialogConfig = inject(DynamicDialogConfig);
  private dialogRef = inject(DynamicDialogRef);

  isEdit = false;
  expense: any;
  messages: Message[] = [];
  validationErrors: { [key: string]: string[] } = {};

  savingStatus$ = this.store.select(savingStatus);

  categories$ = this.categoryService.getCategories().pipe(
    map((cat) => {
      const activeList = cat
        .filter((c) => c.isActive)
        .sort((a, b) => a.order - b.order);
      return [{ id: null, name: '' }, ...activeList];
    })
  );

  sources$ = this.sourceService.getSources().pipe(
    map((cat) => {
      const activeList = cat
        .filter((c) => c.isActive)
        .sort((a, b) => a.order - b.order);
      return [{ id: null, name: '' }, ...activeList];
    })
  );

  form = new FormGroup({
    categoryId: new FormControl<number | null>(null, FormValidation.requiredValidator('Category is required')),
    amount: new FormControl<number | null>(null, [FormValidation.minNumberValidator(1, 'Amount must be greater than 0'), FormValidation.requiredValidator('Amount is required'),]),
    date: new FormControl<Date>(startOfDay(new Date()),FormValidation.requiredValidator('Date is required')),
    description: new FormControl<string>('', FormValidation.requiredValidator('Description is required')),
    sourceId: new FormControl<number | null>(null, FormValidation.requiredValidator('Source is required')),
    tags: new FormControl<string[]>([]),
  });


  ngOnInit() {
    this.expense = this.dialogConfig.data?.expense;
    this.isEdit = this.dialogConfig.data?.isEdit;


    if (this.expense) {
      this.form.patchValue({
        categoryId: this.expense.categoryId,
        date: new Date(this.expense.expenseDate),
        description: this.expense.description,
        amount: this.expense.amount,
        sourceId: this.expense.sourceId,
        tags: this.expense.tags,
      });
    }

    this.savingStatus$
      .pipe(
        skip(1),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((status) => {
        if (status === 'success') {
          this.dialogRef.close({});
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
  }

  submit() {
    this.form.markAsDirty();
    this.form.updateValueAndValidity();
    this.validationErrors = FormValidation.getFormValidationErrors(this.form);
    this.messages = [];

    if (this.form.valid) {
      const form = this.form.value;
      const expense: ExpenseDto = {
        id: this.isEdit ? this.expense.id : null,
        categoryId: form.categoryId!,
        amount: form.amount!,
        expenseDate: form.date,
        description: form.description!,
        sourceId: form.sourceId!,
        tags: form.tags || [],
      };

      if (this.isEdit) {
        this.store.dispatch(updateExpense({ data: expense }));
      } else {
        this.store.dispatch(addExpense({ data: expense }));
      }
    }
  }

  cancel() {
    this.form.reset();
    this.dialogRef.close();
  }
}
