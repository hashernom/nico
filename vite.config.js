import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        port: 5173
    },
    build: {
        outDir: 'dist',
        // Las fotos se sirven desde Supabase Storage; el bundle queda liviano.
        assetsInlineLimit: 4096
    }
});
