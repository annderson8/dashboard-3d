#!/usr/bin/env node
// Comprueba que cada clave que usa el mundo existe en datos/planta.csv. Una clave que falta se vería como un 0 falso.
import fs from "node:fs";
import path from "node:path";

const proyecto = path.resolve(process.argv[2] ?? ".");
const leer = (...r) => fs.readFileSync(path.join(proyecto, ...r), "utf8");

const nombre = leer("src", "mundo.ts").match(/mundos\/([\w-]+)/)?.[1];
if (!nombre) {
  console.error("Error: src/mundo.ts no exporta ningún mundo");
  process.exit(1);
}

const carpeta = path.join(proyecto, "src", "mundos", nombre);
const codigo = fs
  .readdirSync(carpeta)
  .filter((a) => /\.tsx?$/.test(a))
  .map((a) => fs.readFileSync(path.join(carpeta, a), "utf8"))
  .join("\n");

const lineas = leer("datos", "planta.csv").replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
const sep = /^"?clave"?\s*;/i.test(lineas[0] ?? "") ? ";" : ",";
if (!new RegExp(`^"?clave"?\\s*${sep}\\s*"?valor"?`, "i").test(lineas[0] ?? "")) {
  console.error("Error: datos/planta.csv tiene que empezar por las columnas clave,valor");
  process.exit(1);
}
const enCsv = new Set(lineas.slice(1).map((l) => l.split(sep)[0].replace(/"/g, "").trim()));

const usadas = new Set([...codigo.matchAll(/\b\w+\.(?:num|valor|serie|filas)\(\s*"([\w-]+)"/g)].map((m) => m[1]));
for (const m of codigo.matchAll(/\bid:\s*"([\w-]+)"/g)) usadas.add(`${m[1]}_estado`);
for (const m of codigo.matchAll(/\b\w+\.estado\(\s*"([\w-]+)"/g)) usadas.add(`${m[1]}_estado`);
const historial = codigo.match(/\bhistorial:\s*\[([^\]]*)\]/)?.[1] ?? "";
for (const m of historial.matchAll(/"([\w-]+)"/g)) usadas.add(m[1]);

const faltan = [...usadas].filter((c) => !enCsv.has(c)).sort();
const sobran = [...enCsv].filter((c) => !usadas.has(c)).sort();

if (sobran.length) console.log(`Aviso: filas del CSV que el mundo no usa directamente (${sobran.length}): ${sobran.join(", ")}`);
if (faltan.length) {
  console.error(`Faltan en datos/planta.csv (${faltan.length}): ${faltan.join(", ")}`);
  process.exit(1);
}
console.log(`Correcto: el mundo "${nombre}" usa ${usadas.size} claves y todas están en el CSV.`);
