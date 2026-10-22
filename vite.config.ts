import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // permite conexiones desde cualquier IP
    port: 5173, // tu puerto de Vite dev
    strictPort: true,
    allowedHosts: ['localhost'], // aquí tu dominio
  },
});
