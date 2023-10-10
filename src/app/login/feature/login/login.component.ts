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
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  map,
  takeUntil,
} from 'rxjs';
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
import { error, loginStatus, provider } from 'src/app/state/auth/auth.selector';
import { ConfigurationService } from 'src/app/core/data-access/configuration.service';
import { AppUserManagementSettings } from 'src/app/shared/model/app-user-management-settings';

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
  private route = inject(ActivatedRoute);
  private store = inject(Store);
  private configurationService = inject(ConfigurationService);

  validationErrors: { [key: string]: string[] } = {};
  messages: Message[] = [];

  showSocialLogin$: Observable<boolean> = this.route.queryParamMap.pipe(
    map((v) => v.get('socialLogin') == 'true')
  );

  isSocialLoginSelected$ = new BehaviorSubject<boolean>(false);
  loginStatus$ = this.store.select(loginStatus);
  status$ = combineLatest([
    this.store.select(loginStatus),
    this.store.select(provider),
  ]).pipe(map(([status, provider]) => ({ status, provider })));

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

  appConfig$ = this.configurationService
    .getConfigurations()
    .pipe(map((x) => x.appUserManagementSettings));

  ngOnInit() {
    // Navigate to url after login success
    this.loginStatus$.pipe(takeUntil(this.unsubscribe$)).subscribe((status) => {
      // if (status === 'success') {
      //   const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
      //   this.router.navigateByUrl(returnUrl);
      // } else
      if (status === 'error') {
        this.isSocialLoginSelected$.next(false);
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
      this.store.dispatch(login({ idToken: idToken, provider: 'Google' }));
    }
  }

  copy(value: string) {
    navigator.clipboard.writeText(value);
  }
}
