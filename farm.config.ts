import { defineConfig } from '@farmfe/core';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  // compilation: {
  //   // sourcemap: 'inline',
  //   // minify:  false,
  // },
  vitePlugins: [
    vue(),
  ]
});
