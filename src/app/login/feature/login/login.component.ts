import { AuthService } from './../../../shared/data-access/auth.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
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
import { Observable, Subject, map, takeUntil } from 'rxjs';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { SignUpComponent } from 'src/app/login/feature/sign-up/sign-up.component';
import { FormValidation } from 'src/app/shared/utils/form-validation';
import { MessagesModule } from 'primeng/messages';
import { Message, MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { Store } from '@ngrx/store';
import {
  login,
  loginWithEmailAndPassword,
} from 'src/app/state/auth/auth.action';
import { error, loginStatus } from 'src/app/state/auth/auth.selector';

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
    ProgressSpinnerModule,
    TooltipModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [MessageService],
})
export class LoginComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  private afAuth = inject(AngularFireAuth);
  private router = inject(Router);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private store = inject(Store);

  validationErrors: { [key: string]: string[] } = {};
  messages: Message[] = [];

  showSocialLogin$: Observable<boolean> = this.route.queryParamMap.pipe(
    map((v) => v.get('socialLogin') == 'true')
  );

  loginStatus$ = this.store.select(loginStatus);
  errorMessage$ = this.store.select(error).pipe(
    map((e) =>
      !e
        ? []
        : [
            {
              severity: 'error',
              summary: 'Error',
              detail: e,
            },
          ]
    )
  );

  form: FormGroup = new FormGroup({
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

  ngOnInit() {
    // Navigate to url after login success
    this.loginStatus$.pipe(takeUntil(this.unsubscribe$)).subscribe((status) => {
      if (status === 'success') {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  async signInEmailAndPassword() {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
    this.validationErrors = FormValidation.getFormValidationErrors(this.form);

    if (this.form.invalid) return;

    const email = this.form.get('email')?.value;
    const password = this.form.get('password')?.value;
    this.store.dispatch(loginWithEmailAndPassword({ email, password }));
  }

  async signInGoogle() {
    const result = await this.afAuth.signInWithPopup(new GoogleAuthProvider());
    const idToken = await result?.user?.getIdToken();
    if (idToken) {
      this.store.dispatch(login({ idToken: idToken }));
    }
  }

  copy(value: string) {
    navigator.clipboard.writeText(value);
  }
}
