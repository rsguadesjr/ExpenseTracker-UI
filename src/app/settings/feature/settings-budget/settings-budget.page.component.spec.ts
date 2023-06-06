import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsBudgetPageComponent } from './settings-budget.page.component';

describe('SettingsBudgetPageComponent', () => {
  let component: SettingsBudgetPageComponent;
  let fixture: ComponentFixture<SettingsBudgetPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SettingsBudgetPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsBudgetPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
