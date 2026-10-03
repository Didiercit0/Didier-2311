import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxy = {
    '/snailpay': {
      target: env.SNAILPAY_PROXY_TARGET || 'http://127.0.0.1:4001',
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/snailpay/, ''),
    },
  }
  return { plugins: [react()], server: { proxy }, preview: { proxy } }
})
