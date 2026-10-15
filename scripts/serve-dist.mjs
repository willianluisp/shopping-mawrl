import { createReadStream, existsSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = fileURLToPath(new URL('.', import.meta.url))
const dist = resolve(here, '..', 'dist')
const host = '127.0.0.1'
const port = 4173
const types = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2',
}

if (!existsSync(join(dist, 'index.html'))) {
  throw new Error('dist/index.html não foi encontrado. Execute "pnpm build" antes de iniciar a versão compilada.')
}

createServer((request, response) => {
  const pathName = decodeURIComponent(new URL(request.url ?? '/', `http://${host}`).pathname)
  const candidate = normalize(join(dist, pathName === '/' ? 'index.html' : pathName))
  const file = candidate.startsWith(`${dist}${sep}`) && existsSync(candidate) ? candidate : join(dist, 'index.html')
  response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' })
  createReadStream(file).pipe(response)
}).listen(port, host, () => {
  console.log(`Shopping MAWRL disponível em http://${host}:${port}`)
  console.log('Pressione Ctrl+C para encerrar.')
})
