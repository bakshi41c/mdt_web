import { TestBed } from '@angular/core/testing';

import { MdtServerWsService } from './mdt-server-ws.service';

describe('MdtServerWsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MdtServerWsService = TestBed.get(MdtServerWsService);
    expect(service).toBeTruthy();
  });
});
