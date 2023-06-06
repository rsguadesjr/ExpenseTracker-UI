import { Component } from '@angular/core';
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
import { take, finalize } from 'rxjs';
import { FormValidation } from 'src/app/shared/utils/form-validation';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CategoryService } from 'src/app/shared/data-access/category.service';
import { DropdownModule } from 'primeng/dropdown';
import { Option } from 'src/app/shared/model/option.model';
import { format } from 'date-fns';
import { BudgetRequest } from '../../model/budget-request';
import { BudgetResult } from 'src/app/shared/model/budget-result';

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
export class SettingsBudgetFormComponent {
  form!: FormGroup;
  id?: number;

  messages: Message[] = [];
  validationErrors: { [key: string]: string[] } = {};
  saveInProgress = false;

  monthOptions: Option[] = [ { id: -1, name: 'Any' } ];
  yearOptions: Option[] = [ { id: -1, name: 'Any' }]

  constructor(
    public dialogConfig: DynamicDialogConfig,
    private dialogRef: DynamicDialogRef,
    private budgetService: BudgetService,
    private categoryService: CategoryService,
    private toastService: ToastService
  ) {

    const data = dialogConfig.data as BudgetResult;
    this.id = data.id;

    this.form = new FormGroup({
      amount: new FormControl(data?.amount ?? 0, FormValidation.minNumberValidator(1, 'Please enter minimum amount')),
      month: new FormControl(data?.month ? this.monthOptions.find(x => x.id == data.month) : this.monthOptions[0]),
      year: new FormControl(data?.year ? this.yearOptions.find(x => x.id == data.year) : this.yearOptions[0]),
      isActive: new FormControl(data?.isActive),
      budgetCategories: new FormArray([])
    })

    this.categoryService.getCategories()
      .pipe(take(1))
      .subscribe(result => {
        result.forEach(category => {
          const currentCategory = data.budgetCategories?.find(x => x.categoryId == category.id);
          const budgetCategoryFormGroup = new FormGroup({
            categoryId: new FormControl(category.id),
            category: new FormControl(category.name),
            amount: new FormControl(currentCategory?.amount ?? 0)
          });
          (this.form.get('budgetCategories') as FormArray).push(budgetCategoryFormGroup)
        })
      })

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

    if (this.form.invalid || this.saveInProgress)
      return

    this.saveInProgress = true;
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
    console.log('[DEBUG] submit', this.form.value)
    let submit$ = this.id
                  ? this.budgetService.update(data)
                  : this.budgetService.create(data);

    submit$
      .pipe(
        take(1),
        finalize(() => this.saveInProgress = false)
      )
      .subscribe({
        next: (result) => {
          if (result) {
            this.toastService.showSuccess(`${this.id ? 'Updated Successfully' : 'Created Successfully'}`)
            this.dialogRef.close(result);
          }
        },
        error: (v) => {
          this.messages = [{ severity: 'error', summary: 'Error', detail: 'An error occured while saving the entry' } ];
        }
      })
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
