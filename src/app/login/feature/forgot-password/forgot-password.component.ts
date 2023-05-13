import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TabViewModule } from 'primeng/tabview';
import { SignUpComponent } from '../sign-up/sign-up.component';
import { Subject } from 'rxjs';
import { FormValidation } from 'src/app/shared/utils/form-validation';
import { AuthService } from 'src/app/shared/data-access/auth.service';
import { Message, MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    TabViewModule,
    MessagesModule,
    MessageModule,
    RouterModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  providers: [MessageService],
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject<unknown>();

  form: FormGroup;
  validationErrors: { [key: string]: string[] } = {};
  saveInProgress = false;
  messages: Message[] = [];

  constructor(private authService: AuthService, private router: Router) {
    this.form = new FormGroup({
      email: new FormControl('', [
        FormValidation.matchRegexValidator(
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          'Enter a valid email'
        ),
        FormValidation.requiredValidator('Email is required'),
      ]),
    });
  }

  ngOnInit(): void {
  }
  ngOnDestroy(): void {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
  }

  async submit() {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity;
    this.validationErrors = FormValidation.getFormValidationErrors(this.form);
    this.messages = [];

    if (this.form.valid && !this.saveInProgress) {
      this.saveInProgress = true;

      try {

        await this.authService.resetPassword(this.form.get('email')?.value);
        this.messages = [{ severity: 'success', summary: 'Success', detail: 'Password reset email sent' } ];
        this.form.reset();

        // set delay before navigating back to login page
        setTimeout(() => {
          this.router.navigateByUrl('/login')
        }, 3000);
      } catch (err) {
        this.messages = [{ severity: 'error', summary: 'Error', detail: 'An error occured while processing your request' } ];
        this.saveInProgress = false;
      }
    }
  }
}
