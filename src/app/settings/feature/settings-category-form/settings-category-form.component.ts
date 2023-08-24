import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormValidation } from 'src/app/shared/utils/form-validation';
import { Message } from 'primeng/api';
import { CategoryService } from 'src/app/shared/data-access/category.service';
import { CardModule } from 'primeng/card';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ButtonModule } from 'primeng/button';
import { Store } from '@ngrx/store';
import { addCategory, updateCategory } from 'src/app/state/categories/categories.action';
import { savingStatus } from 'src/app/state/categories/categories.selector';
import { filter, skip, take } from 'rxjs';

@Component({
  selector: 'app-settings-category-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MessagesModule,
    InputTextModule,
    CardModule,
    InputSwitchModule,
    ButtonModule
  ],
  templateUrl: './settings-category-form.component.html',
  styleUrls: ['./settings-category-form.component.scss']
})
export class SettingsCategoryFormComponent implements OnInit {
  private dialogConfig = inject(DynamicDialogConfig);
  private dialogRef = inject(DynamicDialogRef);
  private store = inject(Store);


  messages: Message[] = [];
  validationErrors: { [key: string]: string[] } = {};
  id?: string;

  savingStatus$ = this.store.select(savingStatus);

  form: FormGroup = new FormGroup({
    name: new FormControl(null, FormValidation.requiredValidator('Name is required')),
    description: new FormControl(null),
    isActive: new FormControl(true)
  })


  ngOnInit() {
    if (this.dialogConfig.data) {
      const data = this.dialogConfig.data;
      this.id = data.id;
      this.form.patchValue({
        name: data.name,
        description: data.description,
        isActive: data.isActive
      })
    }

    this.savingStatus$.pipe(
      skip(1),
      filter((v) => v === 'success'),
      take(1)
    ).subscribe(() => {
      this.dialogRef.close();
    })
  }


  cancel() {
    this.dialogRef.close();
  }

  submit() {
    this.form.markAsDirty();
    this.form.updateValueAndValidity();
    this.validationErrors = FormValidation.getFormValidationErrors(this.form);
    this.messages = [];

    if (this.form.invalid)
      return

    const data = {
      id: this.id,
      name: this.form.get('name')?.value,
      description: this.form.get('description')?.value,
      isActive: this.form.get('isActive')?.value
    }

    if (this.id)
      this.store.dispatch(updateCategory({ data }));
    else
      this.store.dispatch(addCategory({ data }));

    // let submit$ = this.id
    //               ? this.categoryService.update(data)
    //               : this.categoryService.create(data);

    // submit$
    //   .pipe(
    //     take(1),
    //     finalize(() => this.saveInProgress = false)
    //   )
    //   .subscribe({
    //     next: (result) => {
    //       if (result) {
    //         this.toastService.showSuccess(`${this.id ? 'Updated Successfully' : 'Created Successfully'}`)
    //         this.dialogRef.close(result);
    //       }
    //     },
    //     error: (v) => {
    //       this.messages = [{ severity: 'error', summary: 'Error', detail: 'An error occured while saving the entry' } ];
    //     }
    //   })
  }

}
