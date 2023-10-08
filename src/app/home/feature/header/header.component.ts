import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { BadgeDirective, BadgeModule } from 'primeng/badge';
import { map, of, switchMap } from 'rxjs';
import { ExpenseFormComponent } from 'src/app/expenses/feature/expense-form/expense-form.component';
import { DialogService } from 'primeng/dynamicdialog';
import { Store } from '@ngrx/store';
import { logout } from 'src/app/state/auth/auth.action';
import { user } from 'src/app/state/auth/auth.selector';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ToolbarModule, ButtonModule, MenuModule, BadgeModule],
  providers: [BadgeDirective],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  private dialogService = inject(DialogService);
  private store = inject(Store);

  @Output() showSideBar = new EventEmitter();

  accountMenuItems: MenuItem[] = [
    { label: 'Logout', command: () => this.signOut() },
  ];

  user$ = this.store.select(user);

  toggleSidebar() {
    this.showSideBar.emit(true);
  }

  signOut() {
    this.store.dispatch(logout());
  }

  newEntry() {
    this.dialogService.open(ExpenseFormComponent, {
      width: '420px',
      header: 'Create',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      styleClass: 'component-dialog',
      closeOnEscape: true,
      data: {
        isDialog: true,
      },
    });
  }
}
