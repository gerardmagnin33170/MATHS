import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  root: './public',
  base: '/pole-socle-numerique/progression_ia/',
  build: {
    outDir: '../build',
    emptyOutDir: true,
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'data',
          dest: ''
        }
      ]
    })
  ]
})