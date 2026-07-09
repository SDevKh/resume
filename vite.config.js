import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api-nvidia': {
        target: 'https://integrate.api.nvidia.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-nvidia/, '')
      }
    }
  }
});
