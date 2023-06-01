import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsSourcePageComponent } from './settings-source.page.component';

describe('SettingsSourcePageComponent', () => {
  let component: SettingsSourcePageComponent;
  let fixture: ComponentFixture<SettingsSourcePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SettingsSourcePageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsSourcePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
