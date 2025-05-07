import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuadrantInfoComponent } from './quadrant-info.component';

describe('QuadrantInfoComponent', () => {
  let component: QuadrantInfoComponent;
  let fixture: ComponentFixture<QuadrantInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [QuadrantInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuadrantInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
