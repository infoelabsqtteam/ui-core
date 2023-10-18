/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FormControlService } from './form-control.service';

describe('Service: FormControl', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormControlService]
    });
  });

  it('should ...', inject([FormControlService], (service: FormControlService) => {
    expect(service).toBeTruthy();
  }));
});
