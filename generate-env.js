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

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('❌ SUPABASE_URL or SUPABASE_ANON_KEY is undefined!');
}
console.log('🛠️ Generated environment.prod.ts:');
console.log(envFileContent);

