import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsSourceComponent } from './settings-source.component';

describe('SettingsSourceComponent', () => {
  let component: SettingsSourceComponent;
  let fixture: ComponentFixture<SettingsSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SettingsSourceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
