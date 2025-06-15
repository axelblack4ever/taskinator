import * as fs from 'fs';

const targetPath = './src/environments/environment.prod.ts';
const envFileContent = `
export const environment = {
  production: true,
  supabaseUrl: '\${process.env.SUPABASE_URL}',
  supabaseAnonKey: '\${process.env.SUPABASE_ANON_KEY}'
};
`;

fs.writeFileSync(targetPath, envFileContent);
