import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { transform } from 'esbuild'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))

function resolvedServerUri() {
  return String(process.env.VITE_SERVER_URI || '')
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\/$/, '')
}

export default defineConfig({
  root,
  envDir: root,
  envPrefix: 'VITE_',
  plugins: [
    {
      name: 'require-server-uri-on-netlify',
      config() {
        const uri = resolvedServerUri()
        console.log(`[vite] VITE_SERVER_URI=${uri || '(unset)'}`)
        if (!process.env.NETLIFY) return
        if (!uri || /YOUR-SERVICE/i.test(uri)) {
          throw new Error(
            'VITE_SERVER_URI is missing at build time. In Netlify → Project configuration → Environment variables, set VITE_SERVER_URI to your Railway URL (https://….up.railway.app, no trailing slash). Scopes: Builds. Context: Production. Then Deploys → Trigger deploy → Clear cache and deploy. Do not put this value in netlify.toml; the UI value must be the one Vite sees.',
          )
        }
      },
    },
    {
      name: 'js-as-jsx',
      enforce: 'pre',
      async transform(code, id) {
        const file = id.split('?')[0]
        if (!file.includes('/src/') || file.includes('node_modules') || !file.endsWith('.js')) {
          return null
        }
        const result = await transform(code, {
          loader: 'jsx',
          jsx: 'automatic',
          sourcefile: file,
        })
        return { code: result.code, map: result.map }
      },
    },
    react(),
  ],
  optimizeDeps: {
    entries: [path.resolve(root, 'index.html')],
    rolldownOptions: {
      moduleTypes: {
        '.js': 'jsx',
      },
    },
  },
  server: {
    port: 3000,
    fs: {
      deny: [path.resolve(root, 'build')],
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:5001',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(root, 'index.html'),
    },
  },
})

