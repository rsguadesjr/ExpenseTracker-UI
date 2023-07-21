import { Component, Inject, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-disabled-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './disabled-page.component.html',
  styleUrls: ['./disabled-page.component.scss']
})
export class DisabledPageComponent {

  public location = inject(Location);
}
