import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Message } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastService } from 'src/app/shared/utils/toast.service';
import { BudgetService } from 'src/app/shared/data-access/budget.service';
import { take, finalize, filter, skip } from 'rxjs';
import { FormValidation } from 'src/app/shared/utils/form-validation';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CategoryService } from 'src/app/shared/data-access/category.service';
import { DropdownModule } from 'primeng/dropdown';
import { Option } from 'src/app/shared/model/option.model';
import { format } from 'date-fns';
import { BudgetRequest } from '../../model/budget-request';
import { BudgetResult } from 'src/app/shared/model/budget-result';
import { Store } from '@ngrx/store';
import { savingStatus } from 'src/app/state/budgets/budget.selector';
import { addBudget, updateBudget } from 'src/app/state/budgets/budgets.action';

@Component({
  selector: 'app-settings-budget-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MessagesModule,
    InputTextModule,
    InputSwitchModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    InputNumberModule
  ],
  templateUrl: './settings-budget-form.component.html',
  styleUrls: ['./settings-budget-form.component.scss']
})
export class SettingsBudgetFormComponent implements OnInit {
  private dialogConfig = inject(DynamicDialogConfig);
  private dialogRef = inject(DynamicDialogRef);
  private store = inject(Store);


  monthOptions: Option[] = [ { id: -1, name: 'Any' } ];
  yearOptions: Option[] = [ { id: -1, name: 'Any' }];

  messages: Message[] = [];
  validationErrors: { [key: string]: string[] } = {};
  id?: number;
  savingStatus$ = this.store.select(savingStatus);

  form: FormGroup = new FormGroup({
    amount: new FormControl(null, FormValidation.minNumberValidator(1, 'Please enter minimum amount')),
    month: new FormControl(),
    year: new FormControl(),
    isActive: new FormControl(),
    budgetCategories: new FormArray([])
  })


  ngOnInit() {
    const data = this.dialogConfig.data as BudgetResult;
    this.id = data.id;

    if (data) {
      this.form.patchValue({
        amount: data.amount,
        month: data.month,
        year: data.year,
        isActive: data.isActive
      })
    }

    const currentYear = new Date().getFullYear();
    const months = new Array(12).fill(0).map((x,i) => ({
      id: i+1,
      name: format(new Date(currentYear, i), 'MMMM')
    }) as Option);
    this.monthOptions = [...this.monthOptions, ...months];

    const years = [
      ...new Array(2).fill(0).map((y, i) => (currentYear + (i+1))),
      ...new Array(3).fill(0).map((y, i) => (currentYear - (i))),
    ].map(year => ({
      id: year,
      name: year.toString()
    }) as Option)
    this.yearOptions = [...this.yearOptions, ...years];


    this.savingStatus$.pipe(
      skip(1),
      filter((v) => v === 'success'),
      take(1)
    ).subscribe(() => {
      this.dialogRef.close();
    })
  }

  get budgetCategoriesArray() {
    return this.form.get('budgetCategories') as FormArray;
  }

  cancel() {
    this.dialogRef.close();
  }


  submit() {
    this.form.markAsDirty();
    this.form.updateValueAndValidity();
    this.validationErrors = FormValidation.getFormValidationErrors(this.form);
    this.messages = [];


    const categoryAmountError = this.validateCategoryAmount();
    if (categoryAmountError) {
      this.messages = [{ severity: 'error', summary: 'Error', detail: categoryAmountError } ];
      return;
    }

    if (this.form.invalid)
      return

    const data: BudgetRequest = {
      id: this.id,
      month: this.form.get('month')?.value?.id,
      year: this.form.get('year')?.value?.id,
      isActive: this.form.get('isActive')?.value,
      amount: this.form.get('amount')?.value,
      budgetCategories: (this.form.get('budgetCategories')?.value || [])?.map((x: any) => ({
        amount: x.amount,
        categoryId: x.categoryId
      }))
    }

    if (this.id)
      this.store.dispatch(updateBudget({ data }));
    else
      this.store.dispatch(addBudget({ data }));
  }

  validateCategoryAmount() {
    const amount = this.form.get('amount')?.value ?? 0;
    return this.totalAmount <= amount ? '' : 'Total category amount must be less or equal to the set monthly amount';
  }

  get totalAmount() {
    const budgetCategories: any[] = this.form.get('budgetCategories')?.value || [];
    return budgetCategories.reduce((total, current) => total + current.amount, 0);
  }

  get unallocatedAmount() {
    const amount = this.form.get('amount')?.value ?? 0;
    const unallocated = amount - this.totalAmount;
    return unallocated > 0 ? unallocated : 0;
  }
}
