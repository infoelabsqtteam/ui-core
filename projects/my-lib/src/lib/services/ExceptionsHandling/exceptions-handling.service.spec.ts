import { TestBed } from '@angular/core/testing';

import { ExceptionsHandlingService } from './exceptions-handling.service';

describe('ExceptionsHandlingService', () => {
  let service: ExceptionsHandlingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExceptionsHandlingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
