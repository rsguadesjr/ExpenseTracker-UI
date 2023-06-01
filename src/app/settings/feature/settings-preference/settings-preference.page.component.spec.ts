import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsPreferencePageComponent } from './settings-preference.page.component';

describe('SettingsPreferencePageComponent', () => {
  let component: SettingsPreferencePageComponent;
  let fixture: ComponentFixture<SettingsPreferencePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SettingsPreferencePageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsPreferencePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
