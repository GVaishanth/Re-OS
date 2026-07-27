import { defineConfig } from 'vite';
import path from 'path';
import wasm from 'vite-plugin-wasm';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  base: './',
  plugins: [wasm(), viteSingleFile({ removeViteModuleLoader: true })],
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, './src/core'),
      '@modules': path.resolve(__dirname, './src/modules'),
      '@workers': path.resolve(__dirname, './src/workers'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@styles': path.resolve(__dirname, './src/styles')
    }
  },
  build: {
    target: 'esnext',
    assetsInlineLimit: 100000000, // Inline everything
    cssCodeSplit: false,
    outDir: 'dist',
    emptyOutDir: true
  }
});
