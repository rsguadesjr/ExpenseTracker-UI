import { AuthService } from './shared/data-access/auth.service';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { GoogleAuthProvider } from 'firebase/auth';
import { MenuItem } from 'primeng/api/menuitem';
import { ToastService } from './shared/utils/toast.service';
import { Message, MessageService } from 'primeng/api';
import { ValidationMessageService } from './shared/utils/validation-message.service';
import { Observable, combineLatest, filter, map, startWith } from 'rxjs';

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

  showActionButtons$: Observable<boolean>;
  showViewAllExpensesButton$: Observable<boolean>;
  showNewButton$: Observable<boolean>;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    public authService: AuthService,
    private alertService: ToastService,
    private messageService: MessageService,
    private validationMessagService: ValidationMessageService,
    private route: ActivatedRoute
  ) {
    this.validationMessagService.message$.subscribe((v) => {
      if (v) {
        this.validationMessages = [v,...this.validationMessages];
      }
    })

    const url$ = this.router.events.pipe(
      filter(event => {
        return event instanceof NavigationEnd
      }),
      map((event: any) => router.url.split('?')[0])
    );
    this.showNewButton$ = url$.pipe(
      map(url => ['/', '/expenses'].includes(url))
    )

    this.showViewAllExpensesButton$ = url$.pipe(
      map(url => ['/'].includes(url))
    )

    this.showActionButtons$ = combineLatest([
      this.showViewAllExpensesButton$,
      this.showNewButton$
    ]).pipe(
      map(v => v[0] || v[1])
    )

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

  viewExpenses() {
    this.router.navigate(['/expenses'], {
      queryParams: {
        // startDate: '2022',
        // endDate: this.filter$.value?.endDate,
      },
    });
  }

  newEntry() {
    this.router.navigate(['/expenses', 'new']);
  }
}
