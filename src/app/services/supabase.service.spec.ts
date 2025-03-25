// src/app/services/supabase.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { SupabaseService } from './supabase.service';

describe('SupabaseService', () => {
  let service: SupabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Aquí puedes agregar más pruebas específicas
  // Por ejemplo, podrías hacer mock del cliente Supabase
  // y probar que tus métodos funcionan correctamente
});