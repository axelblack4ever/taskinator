// src/app/models/category.model.ts

/**
 * Interfaz que define la estructura de una categoría
 */
export interface Category {
    id?: number;        // ID único de la categoría
    name: string;       // Nombre de la categoría
    color: string;      // Color en formato hexadecimal (#RRGGBB)
    icon?: string;      // Nombre del icono (opcional)
    user_id?: string;   // ID del usuario propietario
    created_at?: string; // Fecha de creación
  }
  
  /**
   * Interfaz para crear una nueva categoría
   */
  export interface CreateCategoryRequest {
    name: string;
    color: string;
    icon?: string;
  }
  
  /**
   * Interfaz para actualizar una categoría existente
   */
  export interface UpdateCategoryRequest {
    name?: string;
    color?: string;
    icon?: string;
  }