import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensePageComponent } from './expense-page.component';

describe('ExpenseListComponent', () => {
  let component: ExpensePageComponent;
  let fixture: ComponentFixture<ExpensePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpensePageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpensePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
