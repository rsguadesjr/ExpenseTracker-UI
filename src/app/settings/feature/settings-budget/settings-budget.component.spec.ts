import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsBudgetComponent } from './settings-budget.component';

describe('SettingsBudgetComponent', () => {
  let component: SettingsBudgetComponent;
  let fixture: ComponentFixture<SettingsBudgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SettingsBudgetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
