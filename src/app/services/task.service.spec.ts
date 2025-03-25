// src/app/services/task.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';
import { SupabaseService } from './supabase.service';

describe('TaskService', () => {
  let service: TaskService;
  let supabaseSpy: jasmine.SpyObj<SupabaseService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('SupabaseService', [
      'query', 'insert', 'update', 'delete', 'getById', 'getAll'
    ]);
    
    TestBed.configureTestingModule({
      providers: [
        TaskService,
        { provide: SupabaseService, useValue: spy }
      ]
    });
    
    service = TestBed.inject(TaskService);
    supabaseSpy = TestBed.inject(SupabaseService) as jasmine.SpyObj<SupabaseService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Aquí puedes añadir pruebas más específicas para tus métodos
});