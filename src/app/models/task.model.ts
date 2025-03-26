// src/app/models/task.model.ts
// Modelo simplificado eliminando la duplicidad de categorías

/**
 * Interfaz que define la estructura básica de una tarea
 */
export interface Task {
  id?: number;                // ID único de la tarea (generado por Supabase)
  title: string;              // Título de la tarea
  description?: string;       // Descripción opcional
  completed: boolean;         // Estado de completitud
  due_date?: string;          // Fecha de vencimiento (formato ISO)
  priority: TaskPriority;     // Prioridad: 0=Baja, 1=Media, 2=Alta
  created_at?: string;        // Fecha de creación (generado por Supabase)
  updated_at?: string;        // Fecha de última actualización
  user_id?: string;           // ID del usuario propietario (para autenticación)
  category_id?: number;       // Referencia a la categoría (clave foránea)
  task_type?: TaskType;       // Tipo de tarea
  is_important: boolean;      // Marcada como importante
  is_frog: boolean;           // Marcada como "frog" (tarea que debe hacerse primero)
  tags?: string[];            // Etiquetas asociadas a la tarea
}

/**
 * Enumeración de prioridades de tareas
 */
export enum TaskPriority {
  Low = 0,
  Medium = 1,
  High = 2
}

/**
 * Tipos de tareas
 */
export enum TaskType {
  DeepWork = 'deep_work',
  Impulse = 'impulse',
  Maintenance = 'maintenance'
}

/**
 * Interfaz para crear una nueva tarea (puede omitir algunos campos que se generan automáticamente)
 */
export interface CreateTaskRequest {
  title: string;
  description?: string;
  completed?: boolean;
  due_date?: string;
  priority: TaskPriority;
  category_id?: number;
  task_type?: TaskType;
  is_important: boolean;
  is_frog: boolean;
  tags?: string[];
}

/**
 * Interfaz para actualizar una tarea existente (todos los campos son opcionales)
 */
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  due_date?: string;
  priority?: TaskPriority;
  category_id?: number;
  task_type?: TaskType;
  is_important?: boolean;
  is_frog?: boolean;
  tags?: string[];
}

/**
 * Interfaz para la respuesta detallada de una tarea, incluyendo información relacionada
 */
export interface TaskDetailResponse extends Task {
  category?: {
    id: number;
    name: string;
    color: string;
  };
  category_name?: string;
  category_color?: string;
}