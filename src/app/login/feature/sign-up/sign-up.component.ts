import { ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
} from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Validators } from '@angular/forms';
import { FormValidation } from 'src/app/shared/utils/form-validation';
import { AuthService } from 'src/app/shared/data-access/auth.service';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Router, RouterModule } from '@angular/router';

export const passwordMatchValidator: ValidatorFn = (
  controls: AbstractControl
): { [key: string]: boolean } | null => {
  const password = controls.get('password');
  const confirmPassword = controls.get('confirmPassword');

  return password && confirmPassword && password.value !== confirmPassword.value
    ? { passwordMismatch: true }
    : null;
};
@Component({
  selector: 'app-sign-up',
  standalone: true,
  providers: [ConfirmationService],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    RouterModule
  ],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpComponent implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject<unknown>();

  form: FormGroup;
  validationErrors: { [key: string]: string[] } = {};
  signUpInProgress = false;

  constructor(private authService: AuthService, private confirmationService: ConfirmationService, private router: Router) {
    this.form = new FormGroup(
      {
        email: new FormControl('', [
          FormValidation.matchRegexValidator(
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            'Enter a valid email'
          ),
        ]),
        displayName: new FormControl('', [
          FormValidation.minLengthValidator(
            6,
            'At least 6 characters required'
          ),
          FormValidation.maxLengthValidator(20, 'Max of 20 characters only'),
          FormValidation.requiredValidator('Display Name is required'),
        ]),
        password: new FormControl('', [
          FormValidation.minLengthValidator(
            6,
            'At least 6 characters required'
          ),
          FormValidation.maxLengthValidator(20, 'Max of 20 characters only'),
          FormValidation.requiredValidator('Password is required'),
        ]),
        password2: new FormControl('', [
          FormValidation.requiredValidator('The passwords do not match'),
        ]),
      },
      {
        validators: [
          FormValidation.passwordCompareValidator({
            compareKey1: 'password',
            compareKey2: 'password2',
            error: 'Password and Confirm Password must match',
            controlKey: 'passwordCompare',
          }),
        ],
      }
    );
  }

  ngOnInit() {
    // trim email
    this.form.get('email')?.valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe$),
        debounceTime(100)
      )
      .subscribe(v => {
        if (v) {
          this.form.get('email')?.setValue(v.trim(), { emitEvent: false })
        }
      })


    // trim display name
    this.form.get('displayName')?.valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe$),
        debounceTime(100)
      )
      .subscribe(v => {
        if (v) {
          this.form.get('displayName')?.setValue(v.trim(), { emitEvent: false })
        }
      })

  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
  }

  signUp() {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity;
    this.validationErrors = FormValidation.getFormValidationErrors(this.form);

    if (this.form.valid) {
      this.signUpInProgress = true;
      this.authService.signUp({
        displayName: this.form.get('displayName')?.value,
        email: this.form.get('email')?.value,
        password: this.form.get('password')?.value
      }).pipe(
        takeUntil(this.ngUnsubscribe$)
      )
      .subscribe({
        next: (result) => {
          this.confirmationService.confirm({
            header: 'Sign up successful! Please proceed to login form to continue.',
            icon: 'pi pi-check',
            acceptLabel: 'Okay',
            accept: () => {
              this.router.navigateByUrl('/login');
            },
            rejectVisible: false,
            reject: () => {
              this.router.navigateByUrl('/login');
            }});
        },
        error: (err) => {
          this.signUpInProgress = false;
        }
      })

      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.reset('', { emitEvent: false })
      })
    }
  }


  // getFormValidationErrors(form: FormGroup) {
  //   const result: any = {};
  //   const formErrors = Object.assign({}, form.errors);
  //   if (formErrors != null) {
  //     Object.keys(formErrors).forEach((keyError) => {
  //       result[keyError] = [formErrors[keyError]];
  //     });
  //   }

  //   Object.keys(form.controls).forEach((key) => {
  //     const controlErrors = form.get(key)?.errors;
  //     result[key] = result[key] ?? [];
  //     if (controlErrors != null) {
  //       Object.keys(controlErrors).forEach((keyError) => {
  //         result[key].push(controlErrors[keyError]);
  //       });
  //     }
  //   });

  //   return result;
  // }

}
