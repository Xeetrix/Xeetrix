import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const htmlPath = join(root, 'index.html');

await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, 'src'), { recursive: true });
await cp(join(root, 'src'), join(dist, 'src'), { recursive: true });

const html = await readFile(htmlPath, 'utf8');
if (!html.includes('src/main.js') || !html.includes('src/styles.css')) {
  throw new Error('index.html is missing expected Xeetrix assets.');
}
await writeFile(join(dist, 'index.html'), html);

console.log('Built Xeetrix static UI to dist/.');
