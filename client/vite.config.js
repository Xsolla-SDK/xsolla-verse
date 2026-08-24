import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { transform } from 'esbuild'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root,
  plugins: [
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
      },
    },
  },
  preview: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      input: path.resolve(root, 'index.html'),
    },
  },
})

