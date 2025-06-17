import { TestBed } from '@angular/core/testing';
import { StatisticsService } from './statistics.service';
import { TaskService } from './task.service';
import { Task } from '../models/task.model';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('TaskService', ['loadTasks'], {
      currentTasks: [] as Task[]
    });

    TestBed.configureTestingModule({
      providers: [
        StatisticsService,
        { provide: TaskService, useValue: spy }
      ]
    });

    service = TestBed.inject(StatisticsService);
    taskServiceSpy = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should compute total tasks', () => {
    taskServiceSpy.currentTasks.splice(0, taskServiceSpy.currentTasks.length, { title: 'a', completed: false, priority: 0, is_important: false, is_frog: false });
    expect(service.getTotalTasks()).toBe(1);
  });

  it('should compute counts per category', () => {
    taskServiceSpy.currentTasks.splice(0, taskServiceSpy.currentTasks.length,
      { title: 'a', completed: false, priority: 0, is_important: false, is_frog: false, category_id: 1 },
      { title: 'b', completed: false, priority: 0, is_important: false, is_frog: false, category_id: 1 },
      { title: 'c', completed: false, priority: 0, is_important: false, is_frog: false }
    );
    const stats = service.getCountsPerCategory();
    expect(stats.find(s => s.categoryId === 1)?.count).toBe(2);
    expect(stats.find(s => s.categoryId === null)?.count).toBe(1);
  });

  it('should compute completed tasks per week', () => {
    taskServiceSpy.currentTasks.splice(0, taskServiceSpy.currentTasks.length,
      { title: 'a', completed: true, completed_at: '2024-05-06', priority: 0, is_important: false, is_frog: false },
      { title: 'b', completed: true, completed_at: '2024-05-07', priority: 0, is_important: false, is_frog: false },
      { title: 'c', completed: false, priority: 0, is_important: false, is_frog: false }
    );
    const stats = service.getCompletedTasksPerWeek();
    expect(stats.length).toBe(1);
    expect(stats[0].count).toBe(2);
  });
});