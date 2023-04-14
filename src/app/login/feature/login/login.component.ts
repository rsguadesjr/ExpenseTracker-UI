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
import { Subject, pipe, switchMap, take, takeUntil } from 'rxjs';
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
    CardModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<unknown>();

  form: FormGroup;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    public authService: AuthService,
    private route: ActivatedRoute,
    private validationMessageService: ValidationMessageService,
  ) {
    this.form = new FormGroup({
      email: new FormControl(),
      password: new FormControl(),
    });
    this.authService.firebaseToken$
      .pipe( takeUntil(this.ngUnsubscribe) )
      .subscribe((fUser) => {
      if (!fUser) {
        return
      }

      // if login was triggerd by button
      if (this.authService.googleLoginInProgress$.value) {
        // login to api
        // api will return a custom token containing additional custom claims
        this.authService.login(fUser.token)
          .pipe( takeUntil(this.ngUnsubscribe) )
          .subscribe((loginAuthResult) => {
            if (!loginAuthResult.isAuthorized) {
              this.validationMessageService.showError('Access denied for unauthorized users.');
              this.authService.signOut();
            }

            // sign in again using the custom token
            this.afAuth.signInWithCustomToken(loginAuthResult.token).then((result: any) => {
              if (result.user) {
                // after getting the valid token
                // store the information
                result.user.getIdToken(true).then((accessToken: string) => {
                  localStorage.setItem('accessToken', accessToken);
                  localStorage.setItem('user', JSON.stringify({ ...fUser, token: accessToken }));

                  const user = JSON.parse((localStorage.getItem('user') || null ) as any);
                  this.authService.user$.next(user);
                  this.authService.googleLoginInProgress$.next(false);
                  this.router.navigateByUrl('/');
                });
              } else {
                this.authService.user$.next(null);
                this.authService.googleLoginInProgress$.next(false);
              }
            });
        });


        this.authService.googleLoginStatus(false);
      }
    });
  }

  ngOnInit(): void {
    this.afAuth.getRedirectResult().then((result) => {
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }

  forgotPassword() {}

  signInEmailAndPassword() {}

  signInGoogle() {
    this.authService.signInViaGoogle();
  }
}
