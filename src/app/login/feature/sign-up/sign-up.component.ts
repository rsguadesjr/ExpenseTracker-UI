import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
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
import { Subject, debounceTime, from, take, takeUntil } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService, Message } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/core/data-access/auth.service';
import { MessagesModule } from 'primeng/messages';
import { Store } from '@ngrx/store';
import { registerWithEmailAndPassword } from 'src/app/state/auth/auth.action';
import { loginStatus } from 'src/app/state/auth/auth.selector';

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
    RouterModule,
    MessagesModule,
  ],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent implements OnInit {
  private authService = inject(AuthService);
  private store = inject(Store);

  validationErrors: { [key: string]: string[] } = {};
  signUpInProgress = false;
  errorMessage: Message[] = [];
  form!: FormGroup;
  loginStatus$ = this.store.select(loginStatus);

  ngOnInit() {
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

  async signUp() {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity;
    this.validationErrors = FormValidation.getFormValidationErrors(this.form);

    if (this.form.valid) {
      this.signUpInProgress = true;
      const email = this.form.get('email')?.value?.trim();
      const password = this.form.get('password')?.value;
      const displayName = this.form.get('displayName')?.value.trim();
      this.store.dispatch(
        registerWithEmailAndPassword({ data: { email, password, displayName } })
      );

      this.signUpInProgress = false;
    }
  }
}
