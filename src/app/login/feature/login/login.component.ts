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
import { ActivatedRoute, Router } from '@angular/router';
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
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject<unknown>();

  form: FormGroup;
  googleLoginInProgress = false;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    public authService: AuthService,
    private route: ActivatedRoute,
    private validationMessageService: ValidationMessageService
  ) {
    this.form = new FormGroup({
      email: new FormControl(),
      password: new FormControl(),
    });

    // step 1: detect change from firebase auth
    this.afAuth.authState.pipe(takeUntil(this.ngUnsubscribe$)).subscribe({
      next: async (_user) => {
        if (!_user) return;


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

              const result = await this.afAuth.signInWithCustomToken(loginAuthResult.token);
              if (result?.user) {
                const accessToken = await result.user.getIdToken(true);
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('user',JSON.stringify({ ...result.user, token: accessToken }));

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
    this.afAuth.getRedirectResult().then((result) => {});
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
  }

  forgotPassword() {}

  signInEmailAndPassword() {}

  signInGoogle() {
    this.authService.signInViaGoogle();
  }
}
