// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
export const environment = {
  production: false,
  supabase: {
    url: 'https://qlcjvijezszkugirqtgo.supabase.co', // misma URL que en .prod.ts
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2p2aWplenN6a3VnaXJxdGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NTczMTksImV4cCI6MjA1ODMzMzMxOX0._HRLW2BjVKG2sb7yYkhUG0Xt6UiqxNfDzeszznqu3fQ' // misma clave
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
