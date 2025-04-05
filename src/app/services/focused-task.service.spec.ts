import { TestBed } from '@angular/core/testing';

import { FocusedTaskService } from './focused-task.service';

describe('FocusedTaskService', () => {
  let service: FocusedTaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FocusedTaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
