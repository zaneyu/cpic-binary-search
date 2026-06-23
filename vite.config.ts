/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Single-file build: everything inlined into dist/index.html (deploy artifact +
// sandbox verification). High assetsInlineLimit so KaTeX woff2 fonts inline too.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: { assetsInlineLimit: 100_000_000 },
  test: { environment: 'jsdom' },
})
