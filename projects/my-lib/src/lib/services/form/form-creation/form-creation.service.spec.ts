/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FormCreationService } from './form-creation.service';

describe('Service: FormCreation', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormCreationService]
    });
  });

  it('should ...', inject([FormCreationService], (service: FormCreationService) => {
    expect(service).toBeTruthy();
  }));
});
