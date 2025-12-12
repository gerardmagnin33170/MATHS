import { defineConfig } from 'vite'

export default defineConfig({
  root: './public',
  base: '/progression_ia/',
  build: {
    outDir: '../build',
    emptyOutDir: true,
  },
})