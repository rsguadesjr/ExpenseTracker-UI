import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensePerCategoryComponent } from './expense-per-category.component';

describe('ExpensePerCategoryComponent', () => {
  let component: ExpensePerCategoryComponent;
  let fixture: ComponentFixture<ExpensePerCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ExpensePerCategoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensePerCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
