import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EisenhowerPage } from './eisenhower.page';

describe('EisenhowerPage', () => {
  let component: EisenhowerPage;
  let fixture: ComponentFixture<EisenhowerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EisenhowerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
