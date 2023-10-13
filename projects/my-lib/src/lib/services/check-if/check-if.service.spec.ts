/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CheckIfService } from './check-if.service';

describe('Service: CheckIf', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CheckIfService]
    });
  });

  it('should ...', inject([CheckIfService], (service: CheckIfService) => {
    expect(service).toBeTruthy();
  }));
});
