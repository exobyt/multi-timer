import { defineConfig } from '@farmfe/core';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  compilation: {
    sourcemap: 'all-inline',
    minify: false,
  },
  vitePlugins: [
    vue(),
  ]
});
