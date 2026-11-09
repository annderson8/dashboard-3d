#!/usr/bin/env node
// Crea un proyecto de tablero 3D en una carpeta nueva a partir de plantilla/ y de un ejemplo. Solo usa Node.
// Uso: node crear.mjs <carpeta> [--ejemplo tienda|gimnasio|tostadora] [--sin-instalar]
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EJEMPLOS = fs.readdirSync(path.join(raiz, "ejemplos"));

const fallar = (texto) => {
  console.error(`Error: ${texto}`);
  process.exit(1);
};

const args = process.argv.slice(2);
const opcion = (nombre) => {
  const i = args.indexOf(nombre);
  if (i < 0) return undefined;
  const valor = args[i + 1];
  if (!valor || valor.startsWith("--")) fallar(`${nombre} necesita un valor`);
  args.splice(i, 2);
  return valor;
};
const bandera = (nombre) => {
  const i = args.indexOf(nombre);
  if (i >= 0) args.splice(i, 1);
  return i >= 0;
};

const ejemplo = opcion("--ejemplo") ?? "tienda";
const sinInstalar = bandera("--sin-instalar");
if (args.length !== 1 || args[0].startsWith("--")) fallar("uso: node crear.mjs <carpeta> [--ejemplo tienda|gimnasio|tostadora] [--sin-instalar]");
if (!EJEMPLOS.includes(ejemplo)) fallar(`no existe el ejemplo "${ejemplo}". Hay: ${EJEMPLOS.join(", ")}`);

const destino = path.resolve(args[0]);
if (fs.existsSync(destino) && fs.readdirSync(destino).length) fallar(`${destino} ya existe y no está vacía; no toco nada`);

const sinGenerados = (origen) => !["node_modules", "dist"].includes(path.basename(origen));
fs.cpSync(path.join(raiz, "plantilla"), destino, { recursive: true, filter: sinGenerados });
fs.cpSync(path.join(raiz, "ejemplos", ejemplo, "mundo"), path.join(destino, "src", "mundos", ejemplo), { recursive: true });
fs.mkdirSync(path.join(destino, "datos", "ejemplos"), { recursive: true });
fs.copyFileSync(path.join(raiz, "ejemplos", ejemplo, "datos.csv"), path.join(destino, "datos", "planta.csv"));
fs.copyFileSync(path.join(raiz, "ejemplos", ejemplo, "datos.csv"), path.join(destino, "datos", "ejemplos", `${ejemplo}.csv`));
fs.writeFileSync(
  path.join(destino, "src", "mundo.ts"),
  `// El mundo que muestra el tablero. Para tu negocio: crea src/mundos/<tu-negocio>/ y cámbialo aquí.\nexport { ${ejemplo} as MUNDO } from "./mundos/${ejemplo}";\n`,
);
// Se escribe aquí y no en plantilla/: algunos instaladores no copian los .gitignore.
fs.writeFileSync(path.join(destino, ".gitignore"), "node_modules\ndist\n.DS_Store\n*.log\n");

console.log(`Proyecto creado en ${destino} (ejemplo: ${ejemplo})`);
if (!sinInstalar) {
  console.log("Instalando dependencias…");
  const r = spawnSync("npm", ["install", "--no-fund", "--no-audit"], { cwd: destino, stdio: "inherit", shell: process.platform === "win32" });
  if (r.status !== 0) fallar(`npm install falló. Arréglalo y repítelo dentro de ${destino}`);
}
console.log(`Listo. Para verlo: cd "${destino}" && npm run dev`);
