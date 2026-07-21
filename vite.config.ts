import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5199,
    strictPort: true,
    host: true,
  },
  preview: {
    port: 5199,
    strictPort: true,
    host: true,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false
      },
      includeAssets: ['favicon.svg', 'manifest.json'],
      manifest: {
        name: 'Hunter Log - Daily System Protocol',
        short_name: 'HunterLog',
        description: 'Hardcore gamified daily routine tracker inspired by Solo Leveling.',
        theme_color: '#07090e',
        background_color: '#07090e',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  test: {
    globals: true,
    environment: 'node',
  }
});
