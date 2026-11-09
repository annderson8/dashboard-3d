#!/usr/bin/env node
// Comprueba el proyecto: cada clave que usa el mundo existe en el CSV (si falta, se vería un 0 falso), las reglas se entienden y la marca se lee bien.
import fs from "node:fs";
import path from "node:path";

const proyecto = path.resolve(process.argv[2] ?? ".");
const leer = (...r) => fs.readFileSync(path.join(proyecto, ...r), "utf8");
const errores = [];

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
const celdas = (linea) => {
  const salida = [""];
  let comillas = false;
  for (let i = 0; i < linea.length; i++) {
    const c = linea[i];
    if (c === '"' && comillas && linea[i + 1] === '"') (salida[salida.length - 1] += '"'), i++;
    else if (c === '"') comillas = !comillas;
    else if (c === sep && !comillas) salida.push("");
    else salida[salida.length - 1] += c;
  }
  return salida.map((x) => x.trim());
};
const filas = lineas.slice(1).map(celdas);
const enCsv = new Set(filas.map((f) => f[0]));

const usadas = new Set([...codigo.matchAll(/\b\w+\.(?:num|valor|serie|filas)\(\s*"([\w-]+)"/g)].map((m) => m[1]));
const zonas = [...codigo.matchAll(/\bid:\s*"([\w-]+)"/g)].map((m) => m[1]);
for (const z of zonas) usadas.add(`${z}_estado`);
for (const m of codigo.matchAll(/\b\w+\.estado\(\s*"([\w-]+)"/g)) usadas.add(`${m[1]}_estado`);
const historial = codigo.match(/\bhistorial:\s*\[([^\]]*)\]/)?.[1] ?? "";
for (const m of historial.matchAll(/"([\w-]+)"/g)) usadas.add(m[1]);

const faltan = [...usadas].filter((c) => !enCsv.has(c)).sort();
if (faltan.length) errores.push(`Faltan en datos/planta.csv (${faltan.length}): ${faltan.join(", ")}`);

let reglas = 0;
for (const f of filas.filter((x) => x[0].endsWith("_regla"))) {
  reglas++;
  usadas.add(f[0]);
  const zona = f[0].slice(0, -"_regla".length);
  if (!zonas.includes(zona)) errores.push(`${f[0]}: no hay ninguna zona "${zona}"`);
  const r = (f[1] ?? "").match(/^\s*([\w-]+)\s*(>=|<=|>|<|=)\s*([^:<>=]+?)\s*:\s*(atenci[oó]n|parada)\s*$/i);
  if (!r) {
    errores.push(`${f[0]}: "${f[1]}" no se entiende. Ejemplo: reparto_tarde > 5 : atención`);
    continue;
  }
  for (const t of [r[1], r[3]]) {
    if (/^-?[\d.,]+$/.test(t)) continue;
    usadas.add(t);
    if (!enCsv.has(t)) errores.push(`${f[0]}: la clave "${t}" no está en el CSV`);
  }
}

const sobran = [...enCsv].filter((c) => !usadas.has(c)).sort();
if (sobran.length) console.log(`Aviso: filas del CSV que el mundo no usa directamente (${sobran.length}): ${sobran.join(", ")}`);

// La marca. Los proyectos creados antes de marca.json no la tienen.
if (fs.existsSync(path.join(proyecto, "marca.json"))) {
  const m = JSON.parse(leer("marca.json"));
  const hex = /^#[0-9a-f]{6}$/i;
  const malos = ["acento", "fondo", "oscuro"].filter((k) => !hex.test(m[k] ?? ""));
  if (malos.length) errores.push(`marca.json: ${malos.join(", ")} tiene que ser un color como #E4572E`);
  else {
    const rgb = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
    const lum = (c) => {
      const [r, g, b] = rgb(c).map((v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const contraste = (a, b) => {
      const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
      return (x + 0.05) / (y + 0.05);
    };
    if (lum(m.fondo) < 0.6) errores.push(`marca.json: el fondo ${m.fondo} es oscuro. El tablero solo admite fondos claros`);
    if (contraste(m.acento, m.fondo) < 1.25) console.log(`Aviso: marca.json: el acento ${m.acento} casi no se distingue del fondo ${m.fondo}`);
    if (contraste(m.oscuro, m.fondo) < 7) errores.push(`marca.json: el color oscuro ${m.oscuro} no contrasta lo bastante con el fondo (${contraste(m.oscuro, m.fondo).toFixed(1)}, mínimo 7)`);
  }
  for (const k of ["titulos", "cuerpo", "datos"]) if (!m[k] || /[&"<>]/.test(m[k])) errores.push(`marca.json: la tipografía "${k}" no es válida`);
  if (m.logo && !fs.existsSync(path.join(proyecto, "public", m.logo))) errores.push(`marca.json: no encuentro el logo en public/${m.logo}`);
}

if (errores.length) {
  for (const e of errores) console.error(e);
  process.exit(1);
}
console.log(`Correcto: el mundo "${nombre}" usa ${usadas.size} claves${reglas ? ` y ${reglas} reglas` : ""}, y todas están en el CSV.`);
