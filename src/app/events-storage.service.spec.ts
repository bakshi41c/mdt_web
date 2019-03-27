import { TestBed } from '@angular/core/testing';

import { EventsStorageService } from './events-storage.service';

describe('EventsStorageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EventsStorageService = TestBed.get(EventsStorageService);
    expect(service).toBeTruthy();
  });
});
