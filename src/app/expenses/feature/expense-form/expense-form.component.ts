import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { map, takeUntil, Subject, skip, filter, take } from 'rxjs';
import { CalendarModule } from 'primeng/calendar';
import { ExpenseRequestModel } from '../../model/expense-request.model';
import { startOfDay } from 'date-fns';
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
import { selectAllActiveCategories } from 'src/app/state/categories/categories.selector';
import { selectAllActiveSources } from 'src/app/state/sources/sources.selector';

@Component({
  selector: 'app-expense-form',
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
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.scss'],
  providers: [],
})
export class ExpenseFormComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<unknown>();
  private store = inject(Store);
  private dialogConfig = inject(DynamicDialogConfig);
  private dialogRef = inject(DynamicDialogRef);

  isEdit = false;
  expense: any;
  messages: Message[] = [];
  validationErrors: { [key: string]: string[] } = {};

  savingStatus$ = this.store.select(savingStatus);

  categories$ = this.store
    .select(selectAllActiveCategories)
    .pipe(map((data) => [{ id: null, name: '' }, ...data]));

  sources$ = this.store
    .select(selectAllActiveSources)
    .pipe(map((data) => [{ id: null, name: '' }, ...data]));

  form = new FormGroup({
    categoryId: new FormControl<number | null>(
      null,
      FormValidation.requiredValidator('Category is required')
    ),
    amount: new FormControl<number | null>(null, [
      FormValidation.minNumberValidator(1, 'Amount must be greater than 0'),
      FormValidation.requiredValidator('Amount is required'),
    ]),
    date: new FormControl<Date>(
      startOfDay(new Date()),
      FormValidation.requiredValidator('Date is required')
    ),
    description: new FormControl<string>(
      '',
      FormValidation.requiredValidator('Description is required')
    ),
    sourceId: new FormControl<number | null>(
      null,
      FormValidation.requiredValidator('Source is required')
    ),
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
        filter((v) => v === 'success'),
        take(1)
      )
      .subscribe(() => {
        this.dialogRef.close();
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
      const expense: ExpenseRequestModel = {
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
