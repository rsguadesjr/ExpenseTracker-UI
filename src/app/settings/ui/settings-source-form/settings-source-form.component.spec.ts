import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsSourceFormComponent } from './settings-source-form.component';

describe('SettingsSourceFormComponent', () => {
  let component: SettingsSourceFormComponent;
  let fixture: ComponentFixture<SettingsSourceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SettingsSourceFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsSourceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
