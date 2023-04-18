import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseTableViewComponent } from './expense-table-view.component';

describe('ExpenseTableViewComponent', () => {
  let component: ExpenseTableViewComponent;
  let fixture: ComponentFixture<ExpenseTableViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ExpenseTableViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseTableViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
