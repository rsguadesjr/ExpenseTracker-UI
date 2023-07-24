import { Component, OnDestroy, OnInit, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormGroupName, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { MessagesModule } from 'primeng/messages';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Message } from 'primeng/api';
import { FormValidation } from '../../../shared/utils/form-validation';
import { CategoryService } from '../../../shared/data-access/category.service';
import { SourceService } from '../../../shared/data-access/source.service';
import { Observable, Subject, combineLatest, map, take, takeUntil } from 'rxjs';
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
  private ngUnsubscribe$ = new Subject<unknown>();
  form: FormGroup;

  isEdit: boolean;
  categories: Option[] = [];
  sources: Option[] = [];
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

  constructor(
    @Optional() public dialogConfig: DynamicDialogConfig,
    @Optional() private dialogRef: DynamicDialogRef,
    private categoryService: CategoryService,
    private sourceService: SourceService,
    private reminderService: ReminderService,
    private toastService: ToastService) {


    this.isEdit = dialogConfig.data.isEdit;
    const reminder = dialogConfig.data.reminder as ReminderModel;
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

    combineLatest([
      this.categoryService.getCategories().pipe(map(opt => [{ id: undefined, name: '' }, ...opt])),
      this.sourceService.getSources().pipe(map(opt => [{ id: undefined, name: '' }, ...opt]))
    ])
    .pipe(takeUntil(this.ngUnsubscribe$))
    .subscribe(([categories, sources]) => {
      this.categories = categories;
      this.sources = sources;

      if (reminder.categoryId) {
        this.form.get('category')?.setValue(categories.find(x => x.id == reminder.categoryId))
      }

      if (reminder.sourceId) {
        this.form.get('source')?.setValue(sources.find(x => x.id == reminder.sourceId))
      }
    })
  }

  ngOnInit() {
    this.form.get('type')?.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(v => {
        if (v?.id == ReminderType.OneTime) {
          this.form.get('endDate')?.setValue(this.form.get('startDate')?.value, { emitEvent: false });
          this.form.get('endDate')?.disable({ emitEvent: false });
        } else {
          this.form.get('endDate')?.enable({ emitEvent: false });
        }
      });

    this.form.get('type')?.updateValueAndValidity();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
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

    let submit$ = this.isEdit
                  ? this.reminderService.updateReminder(formValue('id'), reminder)
                  : this.reminderService.createReminder(reminder);
    submit$
      .pipe(take(1))
      .subscribe({
        next: (v) => {
          this.toastService.showSuccess(`${this.isEdit ? 'Updated entry' : 'Created new entry'}`);
          this.dialogRef.close();
        },
        error: (v) => {
          this.messages = [{ severity: 'error', summary: 'Error', detail: 'An error occured while saving the entry' } ];
        }
      });
  }
}
