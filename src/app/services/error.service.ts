// src/app/services/error.service.ts
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

export enum ErrorType {
  AUTH = 'auth',
  DATABASE = 'database',
  NETWORK = 'network',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown'
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: any;
  context?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  constructor(private toastController: ToastController) {}

  /**
   * Procesa un error y devuelve un objeto AppError estructurado
   */
  handleError(error: any, context?: any): AppError {
    let appError: AppError;

    // Verificar si es un error de Supabase
    if (error?.code && (error.code.startsWith('PGRST') || error.code.startsWith('P'))) {
      appError = this.handleDatabaseError(error, context);
    } else if (error?.code && error.code.startsWith('auth')) {
      appError = this.handleAuthError(error, context);
    } else if (error?.message && error.message.includes('network')) {
      appError = this.handleNetworkError(error, context);
    } else if (error?.message && error.message.includes('validation')) {
      appError = this.handleValidationError(error, context);
    } else {
      appError = this.handleUnknownError(error, context);
    }

    // Registrar error para depuración
    this.logError(appError);

    return appError;
  }

  /**
   * Muestra un mensaje de error al usuario mediante un toast
   */
  async showErrorMessage(error: AppError | string): Promise<void> {
    const message = typeof error === 'string' ? error : error.message;
    
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'danger',
      buttons: [{
        text: 'Cerrar',
        role: 'cancel'
      }]
    });

    await toast.present();
  }

  /**
   * Procesa errores específicos de autenticación
   */
  private handleAuthError(error: any, context?: any): AppError {
    let message = 'Error de autenticación';

    switch (error.code) {
      case 'auth/invalid-email':
        message = 'El correo electrónico no es válido';
        break;
      case 'auth/user-disabled':
        message = 'Esta cuenta ha sido desactivada';
        break;
      case 'auth/user-not-found':
        message = 'No existe una cuenta con este correo electrónico';
        break;
      case 'auth/wrong-password':
        message = 'Contraseña incorrecta';
        break;
      case 'auth/email-already-in-use':
        message = 'Este correo electrónico ya está registrado';
        break;
      case 'auth/weak-password':
        message = 'La contraseña es demasiado débil';
        break;
      case 'auth/popup-closed-by-user':
        message = 'Inicio de sesión cancelado';
        break;
      default:
        // Si el error viene de Supabase directamente, suele tener una propiedad message
        if (error.message) {
          message = this.sanitizeErrorMessage(error.message);
        }
    }

    return {
      type: ErrorType.AUTH,
      message,
      originalError: error,
      context
    };
  }

  /**
   * Procesa errores específicos de base de datos
   */
  private handleDatabaseError(error: any, context?: any): AppError {
    let message = 'Error en la base de datos';

    if (error.code === 'PGRST301') {
      message = 'No se encontraron resultados';
    } else if (error.code === 'PGRST302') {
      message = 'Se encontraron demasiados resultados';
    } else if (error.code.startsWith('23')) {
      // Errores de restricción en PostgreSQL
      if (error.code === '23505') {
        message = 'Ya existe un registro con esos datos';
      } else if (error.code === '23503') {
        message = 'No se puede realizar la operación porque existen registros relacionados';
      } else if (error.code === '23502') {
        message = 'Faltan datos obligatorios';
      }
    } else if (error.message) {
      message = this.sanitizeErrorMessage(error.message);
    }

    return {
      type: ErrorType.DATABASE,
      message,
      originalError: error,
      context
    };
  }

  /**
   * Procesa errores de red
   */
  private handleNetworkError(error: any, context?: any): AppError {
    return {
      type: ErrorType.NETWORK,
      message: 'Error de conexión. Comprueba tu conexión a internet e inténtalo de nuevo.',
      originalError: error,
      context
    };
  }

  /**
   * Procesa errores de validación
   */
  private handleValidationError(error: any, context?: any): AppError {
    let message = 'Error de validación';
    
    if (error.message) {
      message = this.sanitizeErrorMessage(error.message);
    }
    
    return {
      type: ErrorType.VALIDATION,
      message,
      originalError: error,
      context
    };
  }

  /**
   * Procesa errores desconocidos
   */
  private handleUnknownError(error: any, context?: any): AppError {
    let message = 'Ha ocurrido un error inesperado';
    
    if (error instanceof Error) {
      message = this.sanitizeErrorMessage(error.message);
    } else if (typeof error === 'string') {
      message = this.sanitizeErrorMessage(error);
    } else if (error?.message) {
      message = this.sanitizeErrorMessage(error.message);
    }
    
    return {
      type: ErrorType.UNKNOWN,
      message,
      originalError: error,
      context
    };
  }

  /**
   * Limpia los mensajes de error para hacerlos más amigables
   */
  private sanitizeErrorMessage(message: string): string {
    // Eliminar detalles técnicos y hacer el mensaje más amigable
    return message
      .replace(/error:/gi, '')
      .replace(/exception:/gi, '')
      .replace(/(\r\n|\n|\r)/gm, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Registra el error para depuración
   */
  private logError(appError: AppError): void {
    console.error(`[${appError.type.toUpperCase()}]`, appError.message, {
      originalError: appError.originalError,
      context: appError.context
    });
    
    // Aquí podrías implementar un servicio de registro de errores
    // como Sentry, LogRocket, etc.
  }
}