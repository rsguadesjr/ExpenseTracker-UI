import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { CardModule } from 'primeng/card';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-settings.page',
  standalone: true,
  imports: [CommonModule, MenuModule, CardModule],
  templateUrl: './settings.page.component.html',
  styleUrls: ['./settings.page.component.scss'],
})
export class SettingsPageComponent {
  items: MenuItem[] = [
    {
      label: 'Category',
      title: 'Category',
      routerLink: './category',
    },
    {
      label: 'Source',
      title: 'Category',
      routerLink: './source',
    },
    {
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
