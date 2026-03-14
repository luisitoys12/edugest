// Script de build para GitHub Pages
// Usa process.cwd() en vez de import.meta.url para compatibilidad con GitHub Actions
import { build } from 'vite';
import { resolve } from 'path';

const root = process.cwd();

const config = {
  root: resolve(root, 'client'),
  base: './',
  resolve: {
    alias: {
      '@': resolve(root, 'client/src'),
      '@shared': resolve(root, 'shared'),
      '@assets': resolve(root, 'attached_assets'),
    },
  },
  build: {
    outDir: resolve(root, 'dist/public'),
    emptyOutDir: true,
  },
};

try {
  const react = await import('@vitejs/plugin-react');
  config.plugins = [react.default()];
} catch(e) {
  console.error('Error loading react plugin:', e.message);
  process.exit(1);
}

try {
  await build(config);
  console.log('Build completado exitosamente');
} catch(e) {
  console.error('Build error:', e.message);
  process.exit(1);
}
