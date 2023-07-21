import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisabledPageComponent } from './disabled-page.component';

describe('DisabledPageComponent', () => {
  let component: DisabledPageComponent;
  let fixture: ComponentFixture<DisabledPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ DisabledPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisabledPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
