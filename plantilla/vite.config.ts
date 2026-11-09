import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Sirve datos/planta.csv como /datos.csv, siempre leído del disco, y deja que el panel "Datos" lo guarde (POST).
 * Solo existe en `npm run dev`, en tu equipo, y solo puede escribir ese archivo.
 */
const datos = (archivo = "datos/planta.csv"): Plugin => ({
  name: "tablero-datos",
  configureServer(server) {
    server.middlewares.use("/datos.csv", (req, res) => {
      const ruta = path.resolve(archivo);
      if (req.method === "POST") {
        // Solo la propia página puede guardar: otra web abierta en el navegador no puede tocar el archivo.
        const origen = req.headers.origin;
        if (origen && origen.replace(/^https?:\/\//, "") !== req.headers.host) {
          res.statusCode = 403;
          res.end("Solo el propio tablero puede guardar este archivo");
          return;
        }
        let cuerpo = "";
        let demasiado = false;
        req.setEncoding("utf8");
        req.on("data", (trozo: string) => {
          cuerpo += trozo;
          if (cuerpo.length > 1_000_000) demasiado = true;
        });
        req.on("end", () => {
          if (demasiado || !/^\uFEFF?clave[,;]valor/i.test(cuerpo)) {
            res.statusCode = 400;
            res.end("El CSV tiene que empezar por las columnas clave,valor");
            return;
          }
          // Se escribe en un archivo aparte y se renombra: nadie lee nunca un CSV a medio escribir.
          fs.writeFileSync(`${ruta}.tmp`, cuerpo);
          fs.renameSync(`${ruta}.tmp`, ruta);
          res.statusCode = 204;
          res.setHeader("X-Tablero-Guardado", "si"); // la página solo da por guardado lo que trae esta marca
          res.end();
        });
        return;
      }
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      res.end(fs.readFileSync(ruta));
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
