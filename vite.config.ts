import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin, type ViteDevServer, type PreviewServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'

// Proxy mínimo para o módulo Esportes (Fase 5): o navegador nunca vê o
// token da football-data.org. A chave fica só em .env (não versionado,
// fora de qualquer prefixo VITE_) e é anexada aqui, dentro do processo
// Node do dev server/preview — nunca no bundle, em uma URL ou no
// localStorage. Sem chave configurada, o endpoint responde 503 e o app
// mostra o estado honesto "Conecte a fonte de resultados" (ver
// src/data/sportsApi.ts). Não é um backend: só repassa GET para a
// football-data.org acrescentando o header de autenticação.
function footballDataProxyPlugin(apiKey: string): Plugin {
  const handle = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!req.url?.startsWith('/api/football/')) return next()

    if (!apiKey) {
      res.writeHead(503, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ error: 'missing_api_key' }))
      return
    }

    try {
      const upstreamPath = req.url.replace(/^\/api\/football/, '/v4')
      const upstream = await fetch(`https://api.football-data.org${upstreamPath}`, {
        headers: { 'X-Auth-Token': apiKey },
      })
      const body = await upstream.text()
      res.writeHead(upstream.status, { 'content-type': 'application/json' })
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
