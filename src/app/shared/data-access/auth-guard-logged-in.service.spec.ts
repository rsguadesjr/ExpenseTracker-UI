/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AuthGuardLoggedInService } from './auth-guard-logged-in.service';

describe('Service: AuthGuardLoggedIn', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthGuardLoggedInService]
    });
  });

  it('should ...', inject([AuthGuardLoggedInService], (service: AuthGuardLoggedInService) => {
    expect(service).toBeTruthy();
  }));
});
