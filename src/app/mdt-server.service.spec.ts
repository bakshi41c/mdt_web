import { TestBed } from '@angular/core/testing';

import { MdtServerService } from './mdt-server.service';

describe('MdtServerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MdtServerService = TestBed.get(MdtServerService);
    expect(service).toBeTruthy();
  });
});
