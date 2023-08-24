import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Message } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { SourceService } from 'src/app/shared/data-access/source.service';
import { FormValidation } from 'src/app/shared/utils/form-validation';
import { Store } from '@ngrx/store';
import { addSource, updateSource } from 'src/app/state/sources/sources.action';
import { savingStatus } from 'src/app/state/sources/sources.selector';
import { filter, skip, take } from 'rxjs';
import { SourceRequestModel } from 'src/app/shared/model/source-request.model';

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
export class SettingsSourceFormComponent implements OnInit {
  private dialogConfig = inject(DynamicDialogConfig);
  private dialogRef = inject(DynamicDialogRef);
  private store = inject(Store);

  messages: Message[] = [];
  validationErrors: { [key: string]: string[] } = {};
  id: string | null = null;

  savingStatus$ = this.store.select(savingStatus);

  form: FormGroup = new FormGroup({
    name: new FormControl(null, FormValidation.requiredValidator('Name is required')),
    description: new FormControl(null),
    isActive: new FormControl(true)
  })

  ngOnInit(): void {
    this.form

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
    } as SourceRequestModel

    if (this.id)
      this.store.dispatch(updateSource({ data }))
    else
      this.store.dispatch(addSource({ data }))
  }
}
