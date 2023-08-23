import { Component, OnDestroy, OnInit, Optional, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormGroupName, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { MessagesModule } from 'primeng/messages';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Message } from 'primeng/api';
import { FormValidation } from '../../../shared/utils/form-validation';
import { CategoryService } from '../../../shared/data-access/category.service';
import { SourceService } from '../../../shared/data-access/source.service';
import { Observable, Subject, combineLatest, map, skip, take, takeUntil } from 'rxjs';
import { Option } from '../../../shared/model/option.model';
import { DropdownModule } from 'primeng/dropdown';
import { format, parseISO, startOfDay } from 'date-fns';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { ChipsModule } from 'primeng/chips';
import { MessageModule } from 'primeng/message';
import { ReminderModel } from '../../../shared/model/reminder-model';
import { ReminderType } from '../../../shared/enums/reminder-type';
import { ReminderRequestModel } from '../../../shared/model/reminder-request-model';
import { ToastService } from '../../../shared/utils/toast.service';
import { ReminderService } from '../../data-access/reminder.service';
import { Store } from '@ngrx/store';
import { savingStatus } from 'src/app/state/reminders/reminders.selector';
import { addReminder, updateReminder } from 'src/app/state/reminders/reminders.action';
import { selectAllActiveCategories } from 'src/app/state/categories/categories.selector';
import { selectAllActiveSources } from 'src/app/state/sources/sources.selector';

@Component({
  selector: 'app-reminder-form',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    FormsModule,
    ReactiveFormsModule,
    MessagesModule,
    DropdownModule,
    InputTextModule,
    CalendarModule,
    ChipsModule,
    MessageModule
  ],
  templateUrl: './reminder-form.component.html',
  styleUrls: ['./reminder-form.component.scss']
})
export class ReminderFormComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  private store = inject(Store);
  private dialogConfig = inject(DynamicDialogConfig);
  private dialogRef = inject(DynamicDialogRef);
  private reminderService = inject(ReminderService);

  form!: FormGroup;

  isEdit: boolean = false;
  types: Option[] = [
    { id: undefined, name: '' },
    { id: ReminderType.OneTime, name: 'One Time' },
    { id: ReminderType.Daily, name: 'Daily' },
    { id: ReminderType.Weekly, name: 'Weekly' },
    { id: ReminderType.Monthly, name: 'Monthly' },
    { id: ReminderType.Yearly, name: 'Yearly' },
  ]
  messages: Message[] = [];
  validationErrors: { [key: string]: string[] } = {};

  processState$ = this.reminderService.getProcessState();
  savingStatus$ = this.store.select(savingStatus);
  categories$ = this.store.select(selectAllActiveCategories);
  sources$ = this.store.select(selectAllActiveSources);

  ngOnInit() {
    this.isEdit = this.dialogConfig.data.isEdit;
    const reminder = this.dialogConfig.data.reminder as ReminderModel;
    const type = this.types.find(x => x.id == reminder.type);
    this.form = new FormGroup({
      id: new FormControl(reminder.id),
      subject: new FormControl(reminder.subject, FormValidation.requiredValidator('Subject is required')),
      note: new FormControl(reminder.note),
      startDate: new FormControl(startOfDay(parseISO(reminder.startDate)), FormValidation.requiredValidator('Start Date is required')),
      endDate: new FormControl(reminder.endDate ? startOfDay(parseISO(reminder.endDate)) : null),
      type: new FormControl(type, FormValidation.requiredObjectValidator('id', 'Type is required')),
      expenseDate: new FormControl(reminder.expenseDate ? startOfDay(parseISO(reminder.expenseDate)) : null),
      category: new FormControl({ id: reminder.categoryId }),
      amount: new FormControl(reminder.amount),
      source: new FormControl({ id: reminder.sourceId} ),
      tags: new FormControl(reminder.tags ? reminder.tags.split(',') : []),
      date: new FormControl({ value: format(reminder.date, 'dd-MMM-yyyy'), disabled: true }), // readonly
    });

    this.form.get('type')?.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(v => {
        if (v?.id == ReminderType.OneTime) {
          this.form.get('endDate')?.setValue(this.form.get('startDate')?.value, { emitEvent: false });
          this.form.get('endDate')?.disable({ emitEvent: false });
        } else {
          this.form.get('endDate')?.enable({ emitEvent: false });
        }
      });

    this.form.get('type')?.updateValueAndValidity();


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

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  cancel() {
    this.dialogRef.close();
  }

  submit() {
    this.form.markAsDirty();
    this.form.updateValueAndValidity();
    this.validationErrors = FormValidation.getFormValidationErrors(this.form);

    if (this.form.invalid) {
      return
    }

    const formValue = (key: string) => this.form.get(key)?.value
    const reminder: ReminderRequestModel = {
      id: formValue('id'),
      subject: formValue('subject'),
      note: formValue('note'),
      expenseDate: formValue('expenseDate'),
      amount: formValue('amount'),
      categoryId: formValue('category')?.id,
      sourceId: formValue('source')?.id,
      tags: formValue('tags')?.join(',') || '',
      startDate: formValue('startDate'),
      endDate: formValue('endDate'),
      type: formValue('type')?.id,
    };

    if (this.isEdit) {
      this.store.dispatch(updateReminder({ data: reminder }));
    } else {
      this.store.dispatch(addReminder({ data: reminder }));
    }
  }
}
