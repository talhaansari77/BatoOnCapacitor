import base44 from '@base44/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

// Capacitor needs local, relative assets. The Base44 editor plugin is only
// relevant for the hosted web/editor flow; mobile builds keep the actual SDK
// imports but do not require the Base44 editor build environment.
export default defineConfig(({ mode }) => {
  const isMobileBuild = mode === 'mobile';
  return {
    base: isMobileBuild ? './' : '/',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    plugins: [
      !isMobileBuild && base44({
        legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      }),
      react(),
    ].filter(Boolean),
  };
});
