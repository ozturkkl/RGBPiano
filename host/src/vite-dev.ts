import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer, type ViteDevServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export async function createViteDevServer(
  httpServer: import('node:http').Server,
): Promise<ViteDevServer> {
  return createServer({
    configFile: path.resolve(__dirname, '../vite.config.ts'),
    server: {
      middlewareMode: true,
      hmr: { server: httpServer },
    },
    appType: 'spa',
  })
}
