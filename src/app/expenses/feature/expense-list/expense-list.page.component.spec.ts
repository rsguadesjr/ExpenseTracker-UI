import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseListPageComponent } from './expense-list.page.component';

describe('ExpenseListComponent', () => {
  let component: ExpenseListPageComponent;
  let fixture: ComponentFixture<ExpenseListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpenseListPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
