# Taskinator

## Descripción
Aplicación Angular con Ionic que gestiona tareas y metodologías de productividad. Utiliza Supabase como backend para autenticación y almacenamiento de datos.

## Funcionalidades actuales
- Registro, inicio y cierre de sesión con Supabase
- Creación, actualización y eliminación de tareas
- Vista de tareas del día y tareas atrasadas
- Temporizador Pomodoro con seguimiento de ciclos
- Matriz de Eisenhower para clasificar tareas
- Metodología 3/3/3 con intercambio de tareas
- Gestión de perfil de usuario
- Filtro de tareas por estado (hoy, vencidas, completadas)

## Estructura del proyecto
```
src/
├── app/
│   ├── components/        ← componentes reutilizables (alertas de error)
│   ├── services/          ← lógica de negocio y acceso a Supabase
│   ├── models/            ← interfaces de datos
│   ├── pipes/             ← transformaciones personalizadas
│   ├── guards/            ← protección de rutas
│   ├── methodologies/     ← páginas y componentes de metodologías
│   ├── tasks/             ← creación y listado de tareas
│   ├── today/             ← vista principal de tareas del día
│   ├── login/             ← página de autenticación
│   ├── profile/           ← edición de perfil
│   ├── tabs/              ← navegación principal
│   └── ... (otras páginas como settings o statistics)
...
```

## Componentes y Servicios

### ErrorAlertComponent
- **Ubicación**: `src/app/components/error-alert`
- **Función**: muestra mensajes de error en una tarjeta con opción de cerrar

### PomodoroTimerComponent
- **Ubicación**: `src/app/methodologies/pomodoro/pomodoro-timer`
- **Función**: controla el temporizador usando `PomodoroService`

### PomodoroProgressComponent
- **Ubicación**: `src/app/methodologies/pomodoro/pomodoro-progress`
- **Función**: indica visualmente los pomodoros completados y el estado actual

### FocusedTaskComponent
- **Ubicación**: `src/app/methodologies/pomodoro/focused-task`
- **Función**: muestra la tarea prioritaria seleccionada por `FocusedTaskService`

### TaskListComponent
- **Ubicación**: `src/app/methodologies/pomodoro/task-list`
- **Función**: lista de tareas para Pomodoro con opción de arrastrar para enfocarse en una

### ThreeThreeThreePage y componentes asociados
- **Ubicación**: `src/app/methodologies/three-three-three`
- **Función**: organiza tareas en tres tipos (DeepWork, Impulse, Maintenance); incluye tarjetas, cabeceras y modales para detalles e intercambio de tareas

### EisenhowerPage y componentes asociados
- **Ubicación**: `src/app/methodologies/eisenhower`
- **Función**: presenta las tareas en una matriz de cuatro cuadrantes y permite marcar tareas como completadas

### NewTaskPage
- **Ubicación**: `src/app/tasks/new-task`
- **Función**: formulario para crear una nueva tarea

### TodayPage
- **Ubicación**: `src/app/today`
- **Función**: muestra las tareas programadas para el día con opción de completarlas

### LoginPage
- **Ubicación**: `src/app/login`
- **Función**: autenticación de usuarios (login, registro y recuperación de contraseña)

### ProfilePage
- **Ubicación**: `src/app/profile`
- **Función**: edición del nombre y cambio de contraseña del usuario

### TabsPage
- **Ubicación**: `src/app/tabs`
- **Función**: contenedor de navegación con pestañas para acceder a las secciones

### AuthService
- **Ubicación**: `src/app/services/auth.service.ts`
- **Función**: gestiona el estado de autenticación y operaciones de usuario

### SupabaseService
- **Ubicación**: `src/app/services/supabase.service.ts`
- **Función**: cliente centralizado para consultas a Supabase

### TaskService
- **Ubicación**: `src/app/services/task.service.ts`
- **Función**: operaciones CRUD de tareas y obtención de listas filtradas

### PomodoroService
- **Ubicación**: `src/app/services/pomodoro.service.ts`
- **Función**: maneja el ciclo de trabajo y descansos del temporizador Pomodoro

### FocusedTaskService
- **Ubicación**: `src/app/services/focused-task.service.ts`
- **Función**: determina y mantiene la tarea enfocada para el Pomodoro

### EisenhowerService
- **Ubicación**: `src/app/services/eisenhower.service.ts`
- **Función**: clasifica tareas en la matriz de Eisenhower y detecta atrasos

### ErrorService
- **Ubicación**: `src/app/services/error.service.ts`
- **Función**: procesamiento y muestra de errores mediante toasts

### filterTasks Pipe
- **Ubicación**: `src/app/pipes/filter-tasks.pipe.ts`
- **Función**: filtra arreglos de tareas por vencidas, de hoy o completadas

### authGuard / publicGuard
- **Ubicación**: `src/app/guards/auth.guard.ts`
- **Función**: controla el acceso a rutas según la autenticación

## Instalación y uso
```bash
npm install
ng serve
```

## Dependencias principales
- Angular
- Ionic
- Capacitor
- Supabase
- RxJS
