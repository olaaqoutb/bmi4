import { TestBed } from '@angular/core/testing';

import { ProduktService } from './produkt.service';

describe('ProduktService', () => {
  let service: ProduktService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProduktService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
