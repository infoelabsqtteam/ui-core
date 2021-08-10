import { TestBed } from '@angular/core/testing';

import { CoreUtilityService } from './core-utility.service';

describe('CoreUtilityService', () => {
  let service: CoreUtilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoreUtilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
