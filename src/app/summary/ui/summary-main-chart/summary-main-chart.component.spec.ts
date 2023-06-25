import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryMainChartComponent } from './summary-main-chart.component';

describe('SummaryMainChartComponent', () => {
  let component: SummaryMainChartComponent;
  let fixture: ComponentFixture<SummaryMainChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SummaryMainChartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SummaryMainChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
