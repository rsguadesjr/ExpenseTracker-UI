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
        console.log('[DEBUG] step1', _user);
        if (!_user) return;


        this.googleLoginInProgress = true;
        // if has value, use token to login to api
        const token = await _user.getIdToken(true);
        console.log('[DEBUG] step2', token);
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
              console.log('[DEBUG] step4', result);
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

    // // step 1: detect change from firebase auth
    // this.afAuth.authState
    //   .pipe(takeUntil(this.ngUnsubscribe$))
    //   .subscribe(async (_user) => {
    //     console.log('[DEBUG] step1', _user);
    //     // if has value, use token to login to api
    //     if (_user) {
    //       const token = await _user.getIdToken(true);
    //       console.log('[DEBUG] step2', token);
    //       this.authService
    //         .login(token)
    //         .pipe(takeUntil(this.ngUnsubscribe$))
    //         .subscribe({
    //           next: async (loginAuthResult) => {
    //             if (!loginAuthResult || !loginAuthResult.isAuthorized) {
    //               this.authService.user$.next(null);
    //               this.authService.googleLoginInProgress$.next(false);
    //               return
    //             }

    //             const result = await this.afAuth.signInWithCustomToken(loginAuthResult.token);
    //             console.log('[DEBUG] step4', result);
    //             if (result?.user) {
    //               const accessToken = await result.user.getIdToken(true);
    //               localStorage.setItem('accessToken', accessToken);
    //               localStorage.setItem('user', JSON.stringify({ ...result.user, token: accessToken }));

    //               const user = JSON.parse((localStorage.getItem('user') || null) as any);
    //               this.authService.user$.next(user);
    //               this.authService.googleLoginInProgress$.next(false);
    //               this.router.navigateByUrl('/');
    //             }

    //             console.log('[DEBUG] step3', loginAuthResult);
    //             // after login, and is authorized
    //             // the api will return a custom token containing custom claims
    //             // use the custom token to login again to firebase to get the  latest valid token
    //             if (loginAuthResult.isAuthorized) {
    //               const result = await this.afAuth.signInWithCustomToken(loginAuthResult.token);
    //               console.log('[DEBUG] step4', result);
    //               if (result?.user) {
    //                 const accessToken = await result.user.getIdToken(true);
    //                 localStorage.setItem('accessToken', accessToken);
    //                 localStorage.setItem('user', JSON.stringify({ ...result.user, token: accessToken }));

    //                 const user = JSON.parse((localStorage.getItem('user') || null) as any);
    //                 this.authService.user$.next(user);
    //                 this.authService.googleLoginInProgress$.next(false);
    //                 this.router.navigateByUrl('/');
    //               }
    //               else {
    //                 this.authService.user$.next(null);
    //                 this.authService.googleLoginInProgress$.next(false);
    //               }

    //             } else {
    //               this.authService.signOut();
    //             }
    //           },
    //           error: (error) => {
    //             this.authService.signOut();
    //           },
    //         });
    //     } else {
    //     }
    //   });
    // this.authService.firebaseToken$
    //   .pipe( takeUntil(this.ngUnsubscribe) )
    //   .subscribe((fUser) => {
    //     console.log('[DEBUG] login 0')
    //   // if (!fUser) {
    //   //   return
    //   // }

    //   console.log('[DEBUG] login 1')
    //   // if login was triggerd by button
    //   if (this.authService.googleLoginInProgress$.value) {
    //     console.log('[DEBUG] login 2')
    //     // login to api
    //     // api will return a custom token containing additional custom claims
    //     this.authService.login(fUser.token)
    //       .pipe( takeUntil(this.ngUnsubscribe) )
    //       .subscribe((loginAuthResult) => {
    //         if (!loginAuthResult.isAuthorized) {
    //           this.validationMessageService.showError('Access denied for unauthorized users.');
    //           this.authService.signOut();
    //         }

    //         // sign in again using the custom token
    //         this.afAuth.signInWithCustomToken(loginAuthResult.token).then((result: any) => {
    //           if (result.user) {
    //             // after getting the valid token
    //             // store the information
    //             result.user.getIdToken(true).then((accessToken: string) => {
    //               localStorage.setItem('accessToken', accessToken);
    //               localStorage.setItem('user', JSON.stringify({ ...fUser, token: accessToken }));

    //               const user = JSON.parse((localStorage.getItem('user') || null ) as any);
    //               this.authService.user$.next(user);
    //               this.authService.googleLoginInProgress$.next(false);
    //               this.router.navigateByUrl('/');
    //             });
    //           } else {
    //             this.authService.user$.next(null);
    //             this.authService.googleLoginInProgress$.next(false);
    //           }
    //         });
    //     });

    //     this.authService.googleLoginStatus(false);
    //   }
    // });
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
