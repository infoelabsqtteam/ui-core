/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MultipleFormService } from './multiple-form.service';

describe('Service: MultipleForm', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MultipleFormService]
    });
  });

  it('should ...', inject([MultipleFormService], (service: MultipleFormService) => {
    expect(service).toBeTruthy();
  }));
});
