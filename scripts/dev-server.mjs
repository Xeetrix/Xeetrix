import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = process.cwd();
const port = Number(process.env.PORT || 4173);
const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
]);

createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host}`);
  const cleanPath = normalize(url.pathname === '/' ? '/index.html' : url.pathname).replace(/^[/\\]+/, '');
  const filePath = join(root, cleanPath);

  try {
    const file = await readFile(filePath);
    response.writeHead(200, { 'Content-Type': contentTypes.get(extname(filePath)) || 'application/octet-stream' });
    response.end(file);
  } catch {
    const fallback = await readFile(join(root, 'index.html'));
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(fallback);
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`Xeetrix UI available at http://localhost:${port}`);
});
