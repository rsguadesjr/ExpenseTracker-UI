import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReminderDashboardPageComponent } from './reminder-dashboard.page.component';

describe('ReminderDashboardPageComponent', () => {
  let component: ReminderDashboardPageComponent;
  let fixture: ComponentFixture<ReminderDashboardPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ReminderDashboardPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReminderDashboardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
