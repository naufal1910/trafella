import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
const isVitest = Boolean(process.env.VITEST)

export default defineConfig({
  plugins: [
    vue(),
    // Disable devtools plugin during Vitest to avoid server startup issues
    ...(isVitest ? [] : [vueDevTools()]),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
