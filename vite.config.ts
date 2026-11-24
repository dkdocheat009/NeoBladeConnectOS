import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin, type ViteDevServer, type PreviewServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { SPORTS_COMPETITIONS } from './src/data/sportsApi.ts'

// Proxy mínimo para o módulo Esportes: o navegador nunca vê o token da
// football-data.org. A chave fica só em .env (não versionado, fora de
// qualquer prefixo VITE_) e é anexada aqui, dentro do processo Node do dev
// server/preview — nunca no bundle, em uma URL ou no localStorage. Sem
// chave configurada, o endpoint responde 503 e o app mostra o estado
// honesto "Conecte a fonte de resultados" (ver src/data/sportsApi.ts). Não
// é um backend: só repassa GET para a football-data.org acrescentando o
// header de autenticação, restrito a uma lista de caminhos permitidos
// (Fase 6 — "proteger o proxy contra caminhos arbitrários").
const ALLOWED_PATH = new RegExp(
  `^/competitions/(${SPORTS_COMPETITIONS.map((c) => c.code).join('|')})/(matches|standings|teams)$`,
)

const CACHE_TTL_MS = 30_000
const cache = new Map<string, { at: number; status: number; body: string }>()
const inFlight = new Map<string, Promise<{ status: number; body: string }>>()

function footballDataProxyPlugin(apiKey: string): Plugin {
  const fetchUpstream = async (upstreamPath: string): Promise<{ status: number; body: string }> => {
    const cached = cache.get(upstreamPath)
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached

    const pending = inFlight.get(upstreamPath)
    if (pending) return pending

    const promise = (async () => {
      const upstream = await fetch(`https://api.football-data.org/v4${upstreamPath}`, {
        headers: { 'X-Auth-Token': apiKey },
      })
      const body = await upstream.text()
      const result = { status: upstream.status, body }
      if (upstream.ok) cache.set(upstreamPath, { ...result, at: Date.now() })
      return result
    })()

    inFlight.set(upstreamPath, promise)
    try {
      return await promise
    } finally {
      inFlight.delete(upstreamPath)
    }
  }

  const handle = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!req.url?.startsWith('/api/football/')) return next()

    if (req.method !== 'GET') {
      res.writeHead(405, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ error: 'method_not_allowed' }))
      return
    }

    const upstreamPath = req.url.replace(/^\/api\/football/, '')
    if (!ALLOWED_PATH.test(upstreamPath)) {
      res.writeHead(403, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ error: 'path_not_allowed' }))
      return
    }

    if (!apiKey) {
      res.writeHead(503, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ error: 'missing_api_key' }))
      return
    }

    try {
      const { status, body } = await fetchUpstream(upstreamPath)
      res.writeHead(status, { 'content-type': 'application/json' })
      res.end(body)
    } catch (err) {
      res.writeHead(502, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ error: 'proxy_error', message: (err as Error).message }))
    }
  }

  return {
    name: 'football-data-proxy',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => void handle(req, res, next))
    },
    configurePreviewServer(server: PreviewServer) {
      server.middlewares.use((req, res, next) => void handle(req, res, next))
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), footballDataProxyPlugin(env.FOOTBALL_DATA_API_KEY ?? '')],
  }
})
