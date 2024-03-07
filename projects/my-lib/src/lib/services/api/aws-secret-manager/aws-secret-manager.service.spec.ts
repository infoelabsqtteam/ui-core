import { TestBed } from '@angular/core/testing';

import { AwsSecretManagerService } from './aws-secret-manager.service';

describe('AwsSecretManagerService', () => {
  let service: AwsSecretManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AwsSecretManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
