/// <reference types="vitest" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, mergeConfig } from 'vitest/config'
import baseConfig from './vite.config'

export default mergeConfig(baseConfig, defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'tests/e2e/**',
    ],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))
