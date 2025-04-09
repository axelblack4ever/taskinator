import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThreeThreeThreePage } from './three-three-three.page';

describe('ThreeThreeThreePage', () => {
  let component: ThreeThreeThreePage;
  let fixture: ComponentFixture<ThreeThreeThreePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreeThreeThreePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
