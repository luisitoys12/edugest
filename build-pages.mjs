// build-pages.mjs - GitHub Pages build script
// configFile:false evita cargar vite.config.ts que usa import.meta.url
import { build } from 'vite';
import { resolve } from 'path';

const root = process.cwd();
console.log('CWD:', root);
console.log('Node version:', process.version);

const config = {
  configFile: false,
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
  console.log('React plugin loaded OK');
} catch(e) {
  console.error('React plugin error:', e.stack || e.message);
  process.exit(1);
}

try {
  await build(config);
  console.log('Build completado exitosamente');
} catch(e) {
  console.error('Build failed:', e.stack || e.message);
  process.exit(1);
}
