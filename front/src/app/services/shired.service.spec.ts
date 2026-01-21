import { TestBed } from '@angular/core/testing';

import { ShiredService } from './shired.service';

describe('ShiredService', () => {
  let service: ShiredService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShiredService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
