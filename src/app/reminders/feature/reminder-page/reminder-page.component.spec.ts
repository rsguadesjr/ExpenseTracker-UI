import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReminderPageComponent } from './reminder-page.component';

describe('ReminderPageComponent', () => {
  let component: ReminderPageComponent;
  let fixture: ComponentFixture<ReminderPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ReminderPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReminderPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
