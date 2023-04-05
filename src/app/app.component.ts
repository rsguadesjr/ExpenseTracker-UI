import { AuthService } from './shared/data-access/auth.service';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { GoogleAuthProvider } from 'firebase/auth';
import { MenuItem } from 'primeng/api/menuitem';
import { ToastService } from './shared/utils/toast.service';
import { Message, MessageService } from 'primeng/api';
import { ValidationMessageService } from './shared/utils/validation-message.service';
import { Alert } from './shared/model/alert';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'ExpenseTracker';
  sidebarVisible: boolean = false;

  accountMenuItems: MenuItem[] = [];
  validationMessages: Message[] = [];

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    public authService: AuthService,
    private alertService: ToastService,
    private messageService: MessageService,
    private validationMessagService: ValidationMessageService
  ) {
    // this.afAuth.authState.subscribe((v) => {
    //   if (!v) {
    //     localStorage.removeItem('token');
    //     this.router.navigate(['login']);
    //   }
    //   console.log('[DEBUG] authState', {
    //     result: v,
    //     token: v?.getIdToken(),
    //   });
    //   v?.getIdToken;
    //   v?.getIdToken().then((x) => {
    //     console.log('[DEBUG] authState x', x);
    //     localStorage.setItem('token', 'sample value');
    //   });
    // });
    // this.alertService.toast$.subscribe((v) => {
    //   console.log('[DEBUG] alertSErvice', v);
    //   if (v) {
    //     this.messageService.add({
    //       severity: v.severity,
    //       summary: v.summary,
    //       detail: v.detail,
    //       key: v.key
    //     });
    //   }
    // });

    this.validationMessagService.message$.subscribe((v) => {
      console.log('[DEBUG] validationMessagService', v);
      if (v) {
        this.validationMessages = [v,...this.validationMessages];

        // this.messageService.add({
        //   severity: v.severity,
        //   summary: v.summary,
        //   detail: v.detail,
        //   key: v.key
        // });
      }
    })

    this.validationMessagService.clear$.subscribe((v) => {
      this.validationMessages = [];
    })
  }

  ngOnInit(): void {
    this.accountMenuItems = [
      { label: 'Logout', command: () => this.signOut() },
    ];


  }

  signOut() {
    this.authService.signOut();
  }

  showSideBar() {
    this.sidebarVisible = true;
  }
}
