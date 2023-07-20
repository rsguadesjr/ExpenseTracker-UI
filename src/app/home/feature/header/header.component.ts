import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from 'src/app/shared/data-access/auth.service';
import { BadgeDirective, BadgeModule } from 'primeng/badge';
import { map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ToolbarModule, ButtonModule, MenuModule, BadgeModule],
  providers: [BadgeDirective],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Output() showSideBar = new EventEmitter();

  accountMenuItems: MenuItem[] = [
    { label: 'Logout', command: () => this.signOut() },
  ];

  authService = inject(AuthService);
  authenticated$ = this.authService.isAuthenticated$.pipe(
    switchMap((isAuth) => {
      return isAuth ? this.authService.firebaseUser$ : of(null);
    })
  )

  toggleSidebar() {
    this.showSideBar.emit(true);
  }

  signOut() {
    this.authService.signOut();
  }
}