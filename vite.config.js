import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
    ],
    // WhatsApp session dosyalarının değiştiğinde sayfanın yenilenmesini önle
    server: {
        watch: {
            // Server klasörünü izleme dışı bırak - WhatsApp session dosyaları burada
            ignored: ['**/server/**']
        }
    }
});
