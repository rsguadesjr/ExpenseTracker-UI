import { AuthService } from './shared/data-access/auth.service';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  ActivatedRoute,
  NavigationEnd,
  NavigationStart,
  ParamMap,
  Router,
} from '@angular/router';
import { GoogleAuthProvider } from 'firebase/auth';
import { MenuItem } from 'primeng/api/menuitem';
import { ToastService } from './shared/utils/toast.service';
import { Message, MessageService } from 'primeng/api';
import { ValidationMessageService } from './shared/utils/validation-message.service';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  filter,
  map,
  startWith,
} from 'rxjs';

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

  showActionButtons = false;
  showViewAllExpensesButton = false;
  showNewButton = false;

  queryParams$ = new BehaviorSubject<ParamMap | null>(null);

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
        this.validationMessages = [v, ...this.validationMessages];
      }
    });

    this.route.queryParamMap.subscribe((v) => {
      this.queryParams$.next(v);
    });

    const url$ = this.router.events.pipe(
      filter((event) => {
        return event instanceof NavigationEnd;
      }),
      map((event: any) => router.url.split('?')[0])
    );

    url$.subscribe((url) => {
      this.showNewButton = ['/'].includes(url);
      this.showViewAllExpensesButton = ['/'].includes(url);
      this.showActionButtons =
        this.showNewButton && this.showViewAllExpensesButton;
    });
    this.showNewButton$ = url$.pipe(map((url) => ['/'].includes(url)));

    this.showViewAllExpensesButton$ = url$.pipe(
      map((url) => ['/'].includes(url))
    );

    this.showActionButtons$ = combineLatest([
      this.showViewAllExpensesButton$,
      this.showNewButton$,
    ]).pipe(map((v) => v[0] || v[1]));

    this.validationMessagService.clear$.subscribe((v) => {
      this.validationMessages = [];
    });
  }

  ngOnInit(): void {
    this.accountMenuItems = [
      { label: 'Logout', command: () => this.signOut() },
    ];
  }

  signOut() {
    console.log('[DEBUG] signOut');
    this.authService.signOut();
  }

  showSideBar() {
    this.sidebarVisible = true;
  }

  viewExpenses() {
    const view = this.queryParams$.value?.get('view');
    this.router.navigate(['/expenses'], {
      queryParams: {
        view,
      },
    });
  }

  newEntry() {
    this.router.navigate(['/expenses', 'new']);
  }
}
