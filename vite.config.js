import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api/chat': {
        target: 'https://integrate.api.nvidia.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/chat/, '/v1/chat/completions')
      }
    }
  }
});
