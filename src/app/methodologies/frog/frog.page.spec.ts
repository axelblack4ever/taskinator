import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EatTheFrogPage } from './frog.page';

describe('EatTheFrogPage', () => {
  let component: EatTheFrogPage;
  let fixture: ComponentFixture<EatTheFrogPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EatTheFrogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});