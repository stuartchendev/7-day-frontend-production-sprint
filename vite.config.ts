import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { cloudflare } from '@cloudflare/vite-plugin'
import { sites } from '@openai/sites-vite-plugin'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), sites(), ...(mode === 'test' ? [] : [cloudflare()])],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
}))
