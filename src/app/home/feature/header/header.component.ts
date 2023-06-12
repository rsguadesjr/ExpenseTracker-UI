import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from 'src/app/shared/data-access/auth.service';
import { BadgeDirective, BadgeModule } from 'primeng/badge';

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

  toggleSidebar() {
    this.showSideBar.emit(true);
  }

  signOut() {
    this.authService.signOut();
  }
}
