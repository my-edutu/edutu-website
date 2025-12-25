import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Landing page configuration - runs on port 5174
export default defineConfig({
    plugins: [react()],
    root: resolve(__dirname, 'src/landing'),
    publicDir: resolve(__dirname, 'public'),
    server: {
        port: 5174,
        strictPort: true,
        open: true
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    build: {
        outDir: resolve(__dirname, 'dist-landing'),
        emptyOutDir: true,
    },
    optimizeDeps: {
        exclude: ['lucide-react'],
    },
});
