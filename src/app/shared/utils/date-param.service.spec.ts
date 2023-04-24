import { TestBed } from '@angular/core/testing';

import { DateParamService } from './date-param.service';

describe('DateParamService', () => {
  let service: DateParamService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DateParamService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
