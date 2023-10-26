/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ApiCallResponceService } from './api-call-responce.service';

describe('Service: ApiCallResponce', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApiCallResponceService]
    });
  });

  it('should ...', inject([ApiCallResponceService], (service: ApiCallResponceService) => {
    expect(service).toBeTruthy();
  }));
});
