import { TestBed } from '@angular/core/testing';

import { StrintService } from './strint.service';

describe('StrintService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StrintService = TestBed.get(StrintService);
    expect(service).toBeTruthy();
  });
});
