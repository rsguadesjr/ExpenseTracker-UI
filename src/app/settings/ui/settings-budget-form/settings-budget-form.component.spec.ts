import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsBudgetFormComponent } from './settings-budget-form.component';

describe('SettingsBudgetFormComponent', () => {
  let component: SettingsBudgetFormComponent;
  let fixture: ComponentFixture<SettingsBudgetFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SettingsBudgetFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsBudgetFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
