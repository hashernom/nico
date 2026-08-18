import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
    server: {
        port: 5173
    },
    build: {
        outDir: 'dist',
        // Las fotos se sirven desde Supabase Storage; el bundle queda liviano.
        assetsInlineLimit: 4096,
        rollupOptions: {
            input: {
                // El jardín es la versión oficial. El sitio de scroll queda
                // preservado en /clasico.html (el diseño original también
                // sigue vivo aparte en GitHub Pages, rama `main`).
                index: resolve(__dirname, 'index.html'),
                clasico: resolve(__dirname, 'clasico.html')
            }
        }
    }
});
