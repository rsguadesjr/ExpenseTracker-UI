import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsCategoryPageComponent } from './settings-category.page.component';

describe('SettingsCategoryPageComponent', () => {
  let component: SettingsCategoryPageComponent;
  let fixture: ComponentFixture<SettingsCategoryPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SettingsCategoryPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsCategoryPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
