import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskGroupPage } from './task-group.page';

describe('TaskGroupPage', () => {
  let component: TaskGroupPage;
  let fixture: ComponentFixture<TaskGroupPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskGroupPage]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskGroupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});