import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsCategoryFormComponent } from './settings-category-form.component';

describe('SettingsCategoryFormComponent', () => {
  let component: SettingsCategoryFormComponent;
  let fixture: ComponentFixture<SettingsCategoryFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SettingsCategoryFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsCategoryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
