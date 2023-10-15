import { join } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'vite';
import nodemon from 'nodemon';

const __dirname = fileURLToPath(new URL('./', import.meta.url));
console.clear();

const configFile = join(__dirname, '../vite.config.ts');
const server = await createServer({ configFile });
await server.listen();

process.env.__VITE_LOCAL_URL = server.resolvedUrls.local[0];

nodemon({
  watch: ['electron/**/*.*'],
  ext: 'ts',
  exec: 'node ./tools/electron-tsc.mjs --run'
});
