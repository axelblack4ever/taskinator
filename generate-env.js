const fs = require('fs');

const targetPath = './src/environments/environment.prod.ts';
const envFileContent = `
export const environment = {
  production: true,
  supabase: {
    url: '${process.env.SUPABASE_URL}',
    anonKey: '${process.env.SUPABASE_ANON_KEY}'
  }
};
`;

fs.writeFileSync(targetPath, envFileContent);
