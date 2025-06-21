import { TestBed } from '@angular/core/testing';
import { StatisticsService } from './statistics.service';
import { SupabaseService } from './supabase.service';
import { Task } from '../models/task.model';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let supabaseSpy: jasmine.SpyObj<SupabaseService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('SupabaseService', ['getAll']);

    TestBed.configureTestingModule({
      providers: [
        StatisticsService,
        { provide: SupabaseService, useValue: spy }
      ]
    });

    service = TestBed.inject(StatisticsService);
    supabaseSpy = TestBed.inject(SupabaseService) as jasmine.SpyObj<SupabaseService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should compute totals', async () => {
    const tasks: Task[] = [
      { title: 'a', completed: false, priority: 0, is_important: false, is_frog: false },
      { title: 'b', completed: true, priority: 0, is_important: false, is_frog: false }
    ];
    supabaseSpy.getAll.and.resolveTo(tasks);
    await service.loadData();

    expect(service.getTotalTasks()).toBe(2);
    expect(service.getPendingTotal()).toBe(1);
    expect(service.getCompletedTotal()).toBe(1);
  });

  it('should compute counts per category', async () => {
    const tasks: any[] = [
      { title: 'a', completed: false, priority: 0, is_important: false, is_frog: false, category_name: 'Work' },
      { title: 'b', completed: false, priority: 0, is_important: false, is_frog: false, category_name: 'Work' },
      { title: 'c', completed: true, priority: 0, is_important: false, is_frog: false, category_name: null }
    ];
    supabaseSpy.getAll.and.resolveTo(tasks);
    await service.loadData();
    const stats = service.getCountsPerCategory();
    expect(stats.find(s => s.name === 'Work')?.historical).toBe(2);
    expect(stats.find(s => s.name === 'Work')?.pending).toBe(2);
    expect(stats.find(s => s.name === null)?.historical).toBe(1);
  });

  it('should compute completed tasks per week', async () => {
    const tasks: Task[] = [
      { title: 'a', completed: true, completed_at: '2024-05-06', priority: 0, is_important: false, is_frog: false },
      { title: 'b', completed: true, completed_at: '2024-05-07', priority: 0, is_important: false, is_frog: false },
      { title: 'c', completed: false, priority: 0, is_important: false, is_frog: false }
    ];
    supabaseSpy.getAll.and.resolveTo(tasks);
    await service.loadData();
    const stats = service.getCompletedTasksPerWeek();
    expect(stats.length).toBe(1);
    expect(stats[0].count).toBe(2);
  });
});