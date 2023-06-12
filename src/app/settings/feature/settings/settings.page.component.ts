import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { CardModule } from 'primeng/card';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings.page',
  standalone: true,
  imports: [CommonModule, MenuModule, CardModule, ButtonModule],
  templateUrl: './settings.page.component.html',
  styleUrls: ['./settings.page.component.scss'],
})
export class SettingsPageComponent {
  items: MenuItem[] = [
    {
      icon: 'pi-sliders-v',
      label: 'Category',
      title: 'Category',
      routerLink: './category',
    },
    {
      icon: 'pi-credit-card',
      label: 'Source',
      title: 'Category',
      routerLink: './source',
    },
    {
      icon: 'pi-database',
      label: 'Budget',
      title: 'Budget',
      routerLink: './budget',
    },
    {
      icon:'pi-cog',
      label: 'Preference',
      title: 'Category',
      routerLink: './preference',
    },
  ];

  constructor(private router: Router, private route: ActivatedRoute) {
    // if no route is currently selected, default to the first child route
    if (route.children.length === 0) {
      const firstItem = this.items[0];
      this.router.navigate([firstItem.routerLink], { relativeTo: this.route });
    }
  }
}
