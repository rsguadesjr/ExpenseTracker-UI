import { ExpenseService } from '../../data-access/expense.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { Component, OnDestroy, OnInit, Optional } from '@angular/core';
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
import { map, take, BehaviorSubject, switchMap, of, forkJoin, Observable, takeUntil, Subject, combineLatest } from 'rxjs';
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
    MessagesModule
  ],
  templateUrl: './expense-detail.page.component.html',
  styleUrls: ['./expense-detail.page.component.scss'],
  providers: [],
})
export class ExpenseDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject<unknown>();

  expenseForm!: FormGroup;

  isEdit = false;
  expenseId?: string;

  loadingDetails$ = new BehaviorSubject<boolean>(false);
  categories: Option[] = [];
  sources: Option[] = [];
  messages: Message[] = [];
  validationErrors: { [key: string]: string[] } = {};

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private expenseService: ExpenseService,
    private alertService: ToastService,
    private categoryService: CategoryService,
    private sourceService: SourceService,
    @Optional() public dialogConfig: DynamicDialogConfig,
    @Optional() private dialogRef: DynamicDialogRef
  ) {
    const expense: ExpenseDto | undefined = dialogConfig?.data?.expense;
    this.expenseForm = new FormGroup({
      category: new FormControl(null, FormValidation.requiredObjectValidator('id', 'Category is required')),
      amount: new FormControl<Number | undefined>(expense?.amount, [
        FormValidation.minNumberValidator(1, 'Amount must be greater than 0'),
        FormValidation.requiredValidator('Amount is required')
      ]),
      date: new FormControl(expense?.expenseDate ? startOfDay(parseISO(expense.expenseDate)) : startOfDay(new Date()), FormValidation.requiredValidator('Date is required')),
      description: new FormControl(null, FormValidation.requiredValidator('Description is required')),
      source: new FormControl(null, FormValidation.requiredObjectValidator('id', 'Source is required')),
      tags: new FormControl(expense?.tags ?? [])
    });

    let expenseId$: Observable<string>;
    if (dialogConfig) {
      this.isEdit = dialogConfig.data?.isEdit;
      expenseId$ = of(dialogConfig.data?.id);
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
          next: (result) => {
            if (result) {
              const category = this.categories.find(x => x.id == result.categoryId )
              this.expenseForm.patchValue({
                category: Object.assign({}, category),
                date: new Date(result.expenseDate),
                description: result.description,
                amount: result.amount,
                source: { id: result.sourceId, name: result.source },
                tags: result.tags
              });

            }
          },
          error: (error) => {
            console.log('[DEBUG] error', error)
          }
        });
    }


    combineLatest([
      this.categoryService.getCategories().pipe(map(opt => {
        const activeCategries = opt.filter(x => x.isActive)
                                  .sort((a, b) => a.order - b.order)
                                  .map(x => ({ id: x.id, name: x.name }) as Option);
        return [{ id: undefined, name: '' }, ...activeCategries]
      })),
      this.sourceService.getSources().pipe(map(opt => {
        const activeSources = opt.filter(x => x.isActive)
                                .sort((a, b) => a.order - b.order)
                                .map(x => ({ id: x.id, name: x.name }) as Option);
        return [{ id: undefined, name: '' }, ...activeSources];
      }))
    ])
    .pipe(takeUntil(this.ngUnsubscribe$))
    .subscribe(([categories, sources]) => {
      this.categories = categories;
      this.sources = sources;

      // just there was a delay in getting the options, update category and value here
      // but it should be done in the patch value above
      if (expense?.categoryId) {
        this.expenseForm.get('category')?.setValue(categories.find(x => x.id == expense.categoryId))
      }
      if (expense?.sourceId) {
        this.expenseForm.get('source')?.setValue(sources.find(x => x.id == expense.sourceId))
      }
    })

    // set only unique values
    this.expenseForm.get('tags')?.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(value => {
        value = Array.from(new Set(value))
        this.expenseForm.get('tags')?.setValue(value, { emitEvent: false });
      })
  }

  ngOnInit() {}

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
  }


  submit() {
    this.expenseForm.markAsDirty();
    this.expenseForm.updateValueAndValidity();
    this.validationErrors = FormValidation.getFormValidationErrors(this.expenseForm);
    this.messages = [];

    // if invalid, show an error message
    if (this.expenseForm.invalid) {
      return;
    }

    const expense: ExpenseDto = {
      id: this.isEdit ? this.expenseId : null,
      categoryId: this.expenseForm.get('category')?.value?.id,
      amount: +this.expenseForm.get('amount')?.value,
      expenseDate: this.expenseForm.get('date')?.value,
      description: this.expenseForm.get('description')?.value,
      sourceId: this.expenseForm.get('source')?.value?.id,
      tags: this.expenseForm.get('tags')?.value || []
    };

    let submit$ = this.isEdit
                  ? this.expenseService.updateExpense(this.expenseId!.toString(), expense)
                  : this.expenseService.createExpense(expense);
    submit$
      .pipe(take(1))
      .subscribe({
        next: (v) => {
          this.alertService.showSuccess(`${this.isEdit ? 'Updated entry' : 'Created new entry'}`);
          if (this.dialogRef) {
            this.dialogRef.close(v);
          } else {
            this.location.back();
          }
        },
        error: (v) => {
          this.messages = [{ severity: 'error', summary: 'Error', detail: 'An error occured while saving the entry' } ];
        }
      });

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
