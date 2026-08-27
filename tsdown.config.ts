import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    client: 'src/client/index.ts',
  },
  format: ['cjs'],
  platform: 'browser',
  target: 'es2022',
  outDir: 'lib',
  clean: false,
  sourcemap: false,
  minify: false,
  dts: false,
  outExtensions: () => ({ js: '.js' }),
  deps: {
    neverBundle: [/^react(\/.*)?$/, /^react-dom(\/.*)?$/, /^@deepseek-ai\//],
    alwaysBundle: [/^zod$/],
  },
})
