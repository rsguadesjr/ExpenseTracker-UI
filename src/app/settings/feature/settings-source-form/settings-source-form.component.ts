import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Message } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { finalize, take, tap } from 'rxjs';
import { SourceService } from 'src/app/shared/data-access/source.service';
import { FormValidation } from 'src/app/shared/utils/form-validation';
import { ToastService } from 'src/app/shared/utils/toast.service';

@Component({
  selector: 'app-settings-source-form',
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
  templateUrl: './settings-source-form.component.html',
  styleUrls: ['./settings-source-form.component.scss']
})
export class SettingsSourceFormComponent {
  form!: FormGroup;
  id?: string;

  messages: Message[] = [];
  validationErrors: { [key: string]: string[] } = {};
  saveInProgress = false;

  constructor(
    public dialogConfig: DynamicDialogConfig,
    private dialogRef: DynamicDialogRef,
    private sourceService: SourceService,
    private toastService: ToastService
  ) {

    this.form = new FormGroup({
      name: new FormControl(null, FormValidation.requiredValidator('Name is required')),
      description: new FormControl(null),
      isActive: new FormControl(true)
    })

    if (dialogConfig.data) {
      const data = dialogConfig.data;
      this.id = data.id;
      this.form.patchValue({
        name: data.name,
        description: data.description,
        isActive: data.isActive
      })
    }

  }


  cancel() {
    this.dialogRef.close();
  }

  submit() {
    this.form.markAsDirty();
    this.form.updateValueAndValidity();
    this.validationErrors = FormValidation.getFormValidationErrors(this.form);
    this.messages = [];

    if (this.form.invalid || this.saveInProgress)
      return

    this.saveInProgress = true;
    const data = {
      id: this.id,
      name: this.form.get('name')?.value,
      description: this.form.get('description')?.value,
      isActive: this.form.get('isActive')?.value
    }

    let submit$ = this.id
                  ? this.sourceService.update(data)
                  : this.sourceService.create(data);

    submit$
      .pipe(
        take(1),
        finalize(() => this.saveInProgress = false)
      )
      .subscribe({
        next: (result) => {
          if (result) {
            this.toastService.showSuccess(`${this.id ? 'Updated Successfully' : 'Created Successfuly'}`)
            this.dialogRef.close(result);
          }
        },
        error: (v) => {
          this.messages = [{ severity: 'error', summary: 'Error', detail: 'An error occured while saving the entry' } ];
        }
      })
  }
}
