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
- Técnica *Eat the Frog* para priorizar tareas importantes
- Página de estadísticas con gráficas básicas
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

## Páginas

- **LoginPage** (`src/app/login`) – autenticación de usuarios.
- **ProfilePage** (`src/app/profile`) – edición de datos y cambio de contraseña.
- **TodayPage** (`src/app/today`) – lista de tareas del día.
- **TasksPage** (`src/app/tasks`) – listado general (con acceso a Nueva Tarea).
- **NewTaskPage** (`src/app/tasks/new-task`) – formulario de creación.
- **CategoriesPage** (`src/app/categories`) – gestión básica de categorías.
- **SettingsPage** (`src/app/settings`) – opciones de configuración (esqueleto).
- **StatisticsPage** (`src/app/statistics`) – estadísticas de tareas completadas.
- **MethodologiesPage** (`src/app/methodologies`) – índice de metodologías.
- **PomodoroPage** (`src/app/methodologies/pomodoro`) – temporizador Pomodoro.
- **ThreeThreeThreePage** (`src/app/methodologies/three-three-three`) – método 3/3/3.
- **EisenhowerPage** (`src/app/methodologies/eisenhower`) – matriz de prioridades.
- **EatTheFrogPage** (`src/app/methodologies/frog`) – seleccionar la "rana" del día.
- **TabsPage** (`src/app/tabs`) – navegación por pestañas.

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

### Componentes ThreeThreeThree
- **SectionHeaderComponent** (`src/app/methodologies/three-three-three/section-header`) – cabecera con icono y color según el tipo de tarea.
- **SectionContentComponent** (`src/app/methodologies/three-three-three/section-content`) – contenedor de tarjetas por tipo con eventos para abrir detalles o intercambiar.
- **TaskCardComponent** (`src/app/methodologies/three-three-three/task-card`) – tarjeta individual con prioridad, fecha y acciones.
- **TaskModalComponent** (`src/app/methodologies/three-three-three/task-modal`) – modal de detalles y marcado como completada.
- **TaskSwapModalComponent** (`src/app/methodologies/three-three-three/task-swap-modal`) – permite intercambiar tareas entre tipos.

### Componentes Eisenhower
- **QuadrantInfoComponent** (`src/app/methodologies/eisenhower/components/quadrant-info`) – explica cada cuadrante.
- **TaskDetailComponent** (`src/app/methodologies/eisenhower/modals/task-details`) – detalle completo de tarea con opción de completar.

### Componentes Eat The Frog
- **FrogPage** utiliza solo controles Ionic para mostrar y rotar la tarea "frog".


### AuthService
- **Ubicación**: `src/app/services/auth.service.ts`
- **Función**: gestiona el estado de autenticación y operaciones de usuario
- **Funciones principales**:
  - `signUp`, `signIn`, `signOut`
  - `resetPassword`, `updatePassword`, `updateProfile`
  - `isAuthenticated`, `isTokenValid`, `refreshToken`

### SupabaseService
- **Ubicación**: `src/app/services/supabase.service.ts`
- **Función**: cliente centralizado para consultas a Supabase
- **Funciones**: `query`, `insert`, `update`, `delete`, `getById`, `getAll`

### TaskService
- **Ubicación**: `src/app/services/task.service.ts`
- **Función**: operaciones CRUD de tareas y obtención de listas filtradas
- **Funciones**:
  - `loadTasks`, `loadTodayTasks`, `loadOverdueAndTodayTasks`
  - `getTaskDetails`, `createTask`, `updateTask`, `deleteTask`
  - `toggleTaskCompletion`, `searchTasks`, `getTasksByCategory`
  - `getTasksByRelationCategory`, `getTasksByTag`
  - `getOverdueTasks`, `getFrogTasks`

### PomodoroService
- **Ubicación**: `src/app/services/pomodoro.service.ts`
- **Función**: maneja el ciclo de trabajo y descansos del temporizador Pomodoro
- **Funciones**: `updateSettings`, `startTimer`, `pauseTimer`, `resetTimer`, `skipToNext`

### FocusedTaskService
- **Ubicación**: `src/app/services/focused-task.service.ts`
- **Función**: determina y mantiene la tarea enfocada para el Pomodoro
- **Funciones**: `refreshTasks`, `setFocusedTask`, `markFocusedTaskAsCompleted`, `getAvailableTasks`

### EisenhowerService
- **Ubicación**: `src/app/services/eisenhower.service.ts`
- **Función**: clasifica tareas en la matriz de Eisenhower y detecta atrasos
- **Funciones**: `refreshMatrix`, `completeTask`, observables `matrixTasks$`, `overdueTasks$`

### StatisticsService
- **Ubicación**: `src/app/services/statistics.service.ts`
- **Función**: calcula totales de tareas y agrupaciones por semana y categoría
- **Funciones**: `loadData`, `getTotalTasks`, `getPendingTotal`, `getCompletedTotal`, `getCompletedTasksPerWeek`, `getCountsPerCategory`

### ErrorService
- **Ubicación**: `src/app/services/error.service.ts`
- **Función**: procesamiento y muestra de errores mediante toasts
- **Funciones**: `handleError`, `showErrorMessage` y helpers de categorización

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