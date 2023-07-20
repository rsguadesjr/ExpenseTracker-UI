import { AuthService } from './../../../shared/data-access/auth.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  Subject,
  finalize,
} from 'rxjs';
import { CardModule } from 'primeng/card';
import { ValidationMessageService } from 'src/app/shared/utils/validation-message.service';
import { TabViewModule } from 'primeng/tabview';
import { SignUpComponent } from 'src/app/login/feature/sign-up/sign-up.component';
import { FormValidation } from 'src/app/shared/utils/form-validation';
import { MessagesModule } from 'primeng/messages';
import { Message, MessageService } from 'primeng/api';
import {
  GoogleSigninButtonModule,
  SocialAuthService,
} from '@abacritt/angularx-social-login';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    CardModule,
    TabViewModule,
    SignUpComponent,
    RouterModule,
    MessagesModule,
    GoogleSigninButtonModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [MessageService],
})
export class LoginComponent implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject<unknown>();

  form: FormGroup;
  socialLoginInProgress = false;

  tabIndex = 0;

  validationErrors: { [key: string]: string[] } = {};
  emailAndPasswordLoginInProgress = false;
  messages: Message[] = [];

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    public authService: AuthService,
    private route: ActivatedRoute,
    private validationMessageService: ValidationMessageService,
    private socialAuthService: SocialAuthService
  ) {
    this.form = new FormGroup({
      email: new FormControl('', [
        FormValidation.matchRegexValidator(
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          'Enter a valid email'
        ),
        FormValidation.requiredValidator('Email is required'),
      ]),
      password: new FormControl('', [
        FormValidation.requiredValidator('Password is required'),
      ]),
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
  }

  forgotPassword() {}

  async signInEmailAndPassword() {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
    this.validationErrors = FormValidation.getFormValidationErrors(this.form);
    this.messages = [];

    const data = {
      email: this.form.get('email')?.value,
      password: this.form.get('password')?.value
    };

    this.emailAndPasswordLoginInProgress = true;
    try {
      const result = await this.authService.signInWithEmailAndPassword(data);
      const idToken = await result?.user?.getIdToken();
      if (idToken) {
        this.authService
          .login(idToken, 'Google')
          .pipe(finalize(() => (this.socialLoginInProgress = false)))
          .subscribe({
            next: (result) => {
              this.authService.setAuthData(result);
              const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
              this.router.navigateByUrl(returnUrl);
            },
            error: (error) => {
              this.messages = [
                {
                  severity: 'error',
                  summary: 'Error',
                  detail: error.error ?? 'Invalid login credentials',
                },
              ];
              this.authService.signOut();
            },
          });
      }
    }
    catch(e) {
      console.log(e);
      this.messages = [
        {
          severity: 'error',
          summary: 'Error',
          detail: 'An unexpected error was encountered',
        },
      ];
      this.socialLoginInProgress = false;
    }

  }

  async signInGoogle() {
    // clear messages first
    this.messages = [];

    try {
      const result = await this.afAuth.signInWithPopup(new GoogleAuthProvider());

      this.socialLoginInProgress = true;
        const idToken = await result?.user?.getIdToken();
        if (idToken) {
          this.authService
            .login(idToken, 'Google')
            .pipe(finalize(() => (this.socialLoginInProgress = false)))
            .subscribe({
              next: (result) => {
                this.authService.setAuthData(result);
                const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                this.router.navigateByUrl(returnUrl);
              },
              error: (error) => {
                this.messages = [
                  {
                    severity: 'error',
                    summary: 'Error',
                    detail: error.error ?? 'Invalid login credentials',
                  },
                ];
                this.authService.signOut();
              },
            });
        }
    }
    catch(e) {
      console.log(e);
      this.messages = [
        {
          severity: 'error',
          summary: 'Error',
          detail: 'An unexpected error was encountered',
        },
      ];
      this.socialLoginInProgress = false;
    }

    // this.afAuth
    //   .signInWithPopup(new GoogleAuthProvider())
    //   .then(async (result) => {
    //     this.socialLoginInProgress = true;
    //     const idToken = await result.user?.getIdToken();
    //     if (idToken) {
    //       this.authService
    //         .login(idToken, 'Google')
    //         .pipe(finalize(() => (this.socialLoginInProgress = false)))
    //         .subscribe({
    //           next: (result) => {
    //             this.authService.setAuthData(result);
    //             const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    //             this.router.navigateByUrl(returnUrl);
    //           },
    //           error: (error) => {
    //             this.messages = [
    //               {
    //                 severity: 'error',
    //                 summary: 'Error',
    //                 detail: error.error ?? 'Invalid login credentials',
    //               },
    //             ];
    //             this.authService.signOut();
    //           },
    //         });
    //     }
    //   });
  }
}
