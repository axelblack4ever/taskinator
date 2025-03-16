import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MethodologiesPage } from './methodologies.page';

describe('MethodologiesPage', () => {
  let component: MethodologiesPage;
  let fixture: ComponentFixture<MethodologiesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MethodologiesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
