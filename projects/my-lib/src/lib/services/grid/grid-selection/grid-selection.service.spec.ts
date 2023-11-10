/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { GridSelectionService } from './grid-selection.service';

describe('Service: GridSelection', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GridSelectionService]
    });
  });

  it('should ...', inject([GridSelectionService], (service: GridSelectionService) => {
    expect(service).toBeTruthy();
  }));
});
