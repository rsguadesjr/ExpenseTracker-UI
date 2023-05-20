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
  from,
  lastValueFrom,
  map,
  mergeMap,
  of,
  pipe,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';
import { CardModule } from 'primeng/card';
import { ValidationMessageService } from 'src/app/shared/utils/validation-message.service';
import { TabViewModule } from 'primeng/tabview';
import { SignUpComponent } from 'src/app/login/feature/sign-up/sign-up.component';
import { FormValidation } from 'src/app/shared/utils/form-validation';
import { FirebaseError } from 'firebase/app';
import { MessagesModule } from 'primeng/messages';
import { Message, MessageService } from 'primeng/api';

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
    MessagesModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [MessageService],
})
export class LoginComponent implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject<unknown>();

  form: FormGroup;
  googleLoginInProgress = false;

  tabIndex = 0;

  validationErrors: { [key: string]: string[] } = {};
  emailAndPasswordLoginInProgress = false;
  messages: Message[] = [];

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    public authService: AuthService,
    private route: ActivatedRoute,
    private validationMessageService: ValidationMessageService
  ) {
    this.form = new FormGroup({
      email: new FormControl('', [
        FormValidation.matchRegexValidator(
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          'Enter a valid email'
        ),
        FormValidation.requiredValidator('Email is required')
      ]),
      password: new FormControl('', [FormValidation.requiredValidator('Password is required'),]),
    });

    // step 1: detect change from firebase auth
    this.afAuth.authState.pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
      next: async (_user) => {
        if (!_user) return;

        const testResult = await _user.getIdTokenResult();


        this.googleLoginInProgress = true;
        // if has value, use token to login to api
        const token = await _user.getIdToken(true);
        this.authService
          .login(token)
          .pipe(takeUntil(this.ngUnsubscribe$))
          .subscribe({
            next: async (loginAuthResult) => {
              if (!loginAuthResult || !loginAuthResult.isAuthorized) {
                this.authService.user$.next(null);
                this.authService.googleLoginInProgress$.next(false);
                return;
              }

              const idTokenResult = await _user.getIdTokenResult();
              if (idTokenResult) {
                localStorage.setItem('accessToken', idTokenResult.token);
                localStorage.setItem('user',JSON.stringify({ ..._user, token: idTokenResult.token }));

                const user = JSON.parse((localStorage.getItem('user') || null) as any);
                this.authService.user$.next(user);
                this.authService.googleLoginInProgress$.next(false);
                this.router.navigateByUrl('/');
              }
            },
            error: (error) => {
              this.googleLoginInProgress = false;
              this.authService.signOut();
            },
          });
      },
      error: (error) => {
        this.googleLoginInProgress = false;
      },
    });

  }

  ngOnInit(): void {
    this.afAuth.getRedirectResult().then((result) => {
      console.log('[DEBUG]  getRedirectResult', JSON.parse(JSON.stringify(result)));
    });
  }

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

    if (this.form.valid) {
      this.emailAndPasswordLoginInProgress = true;
      const email = this.form.get('email')?.value;
      const password = this.form.get('password')?.value;
      try {
        await this.authService.signInWithEmailAndPassword(email, password);
      } catch (e) {
        const code = (e as FirebaseError)?.code ?? '';
        switch(code) {
          case 'auth/too-many-requests':
            this.messages = [{ severity: 'error', summary: 'Error', detail: 'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later' } ];
            break;
          case 'auth/invalid-email':
          case 'auth/wrong-password':
            this.messages = [{ severity: 'error', summary: 'Error', detail: 'Invalid email or password entered' } ];
            break;
          case 'auth/user-not-found':
            this.messages = [{ severity: 'error', summary: 'Error', detail: 'Entered email is not found. If not yet registered, proceed to sign up.' } ];
            break;
          default:
            this.messages = [{ severity: 'error', summary: 'Error', detail: 'An error occured while processing your request' } ];
            break;
        }

        this.emailAndPasswordLoginInProgress = false;
      }
    }
  }

  signInGoogle() {
    this.authService.signInViaGoogle();
  }
}
