import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          vendor: ['d3', 'gsap', 'dat.gui']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    host: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shaders': path.resolve(__dirname, './src/shaders')
    }
  },
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr']
});