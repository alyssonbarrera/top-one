import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': '/src',
      '@test': '/test',
    },
  },
  test: {
    env: { NODE_ENV: 'test' },
    globals: true,
    root: './',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['**/infra/**', '**/core/**', '**/utils/**'],
    },
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
})
