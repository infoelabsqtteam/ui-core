/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FormValueService } from './form-value.service';

describe('Service: FormValue', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormValueService]
    });
  });

  it('should ...', inject([FormValueService], (service: FormValueService) => {
    expect(service).toBeTruthy();
  }));
});
