// Servidor local para testar antes de publicar:  ANTHROPIC_API_KEY=... node dev-server.js
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import empresa from './api/empresa.js';
import conversa from './api/conversa.js';
import status from './api/status.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const routes = { '/api/empresa': empresa, '/api/conversa': conversa, '/api/status': status };
const files = { '/': 'index.html', '/index.html': 'index.html', '/robots.txt': 'robots.txt', '/favicon.svg': 'favicon.svg' };
const types = { '.html': 'text/html; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.svg': 'image/svg+xml' };

http
  .createServer((req, res) => {
    const { pathname } = new URL(req.url, 'http://localhost');
    if (routes[pathname]) return routes[pathname](req, res);
    const file = files[pathname];
    if (!file) { res.statusCode = 404; return res.end('Não encontrado'); }
    res.setHeader('content-type', types[path.extname(file)]);
    fs.createReadStream(path.join(here, file)).pipe(res);
  })
  .listen(Number(process.env.PORT) || 3000, () => console.log(`Sentinela IA em http://localhost:${Number(process.env.PORT) || 3000}`));
