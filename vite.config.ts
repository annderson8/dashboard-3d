import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/** Sirve datos/planta.csv como /datos.csv, siempre leído del disco: guardas el archivo y el tablero lo ve en la siguiente lectura. */
const datos = (archivo = "datos/planta.csv"): Plugin => ({
  name: "tablero-datos",
  configureServer(server) {
    server.middlewares.use("/datos.csv", (_req, res) => {
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      res.end(fs.readFileSync(path.resolve(archivo)));
    });
  },
  generateBundle() {
    this.emitFile({ type: "asset", fileName: "datos.csv", source: fs.readFileSync(path.resolve(archivo)) });
  },
});

export default defineConfig({
  plugins: [react(), datos()],
  // Three.js va en su propio archivo: cambia poco y el navegador lo guarda en caché.
  build: { rollupOptions: { output: { manualChunks: { three: ["three", "@react-three/fiber"] } } }, chunkSizeWarningLimit: 1000 },
});
