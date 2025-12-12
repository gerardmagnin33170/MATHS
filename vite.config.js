import { defineConfig } from 'vite'

export default defineConfig({
  root: './public',
  base: '/pole-socle-numerique/progression_ia/',
  publicDir: 'data',
  build: {
    outDir: '../build',
    emptyOutDir: true,
  },
})