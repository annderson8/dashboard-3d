// Colores y tipografías del tablero. No los cambies aquí: salen de marca.json, y de sus tres colores se calcula el resto.
import marca from "../../marca.json";

const aRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const aHex = (rgb: number[]) => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`.toUpperCase();

/** Punto entre dos colores: 0 es `a`, 1 es `b`. */
export const mezcla = (a: string, b: string, t: number) => {
  const [x, y] = [aRgb(a), aRgb(b)];
  return aHex(x.map((v, i) => v + (y[i] - v) * t));
};

/** El mismo tono con otra saturación (multiplicada por `fs`) y otra luz. */
const variante = (hex: string, fs: number, luz: (l: number) => number) => {
  const [r, g, b] = aRgb(hex).map((v) => v / 255);
  const [max, min] = [Math.max(r, g, b), Math.min(r, g, b)];
  const d = max - min;
  const l0 = (max + min) / 2;
  const s0 = d === 0 ? 0 : d / (1 - Math.abs(2 * l0 - 1));
  const h = d === 0 ? 0 : max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  const l = luz(l0);
  const c = (1 - Math.abs(2 * l - 1)) * s0 * fs;
  const canal = (n: number) => {
    const k = (n + h) % 6;
    return (l + c / 2 - c * Math.max(0, Math.min(k, 4 - k, 1))) * 255;
  };
  return aHex([canal(5), canal(3), canal(1)]);
};

const { acento, fondo, oscuro } = marca;
const gris = (t: number) => mezcla(oscuro, fondo, t);

export const color = {
  grafito: oscuro,
  niebla: fondo,
  piedra: gris(0.315),
  acento,
  acentoClaro: variante(acento, 0.85, (l) => Math.min(0.62, Math.max(l + 0.2, 0.46))), // acento sobre fondo oscuro
  blanco: "#FFFFFF",
  borde: gris(0.87),
  metaOscuro: gris(0.63),
  divisorOscuro: gris(0.14),
  textoSobreAcento: variante(acento, 0.55, () => 0.86),
  grafitoSuave: gris(0.075),
  acero: gris(0.8),
  hueso: gris(0.953),
};

/** `"Poppins:wght@700"` → `'Poppins', <respaldo>`. Las fuentes se cargan de Google Fonts (lo hace vite.config.ts). */
const familia = (espec: string, respaldo: string) => `'${espec.split(":")[0]}', ${respaldo}`;

export const fuente = {
  titulos: familia(marca.titulos, "system-ui, sans-serif"),
  cuerpo: familia(marca.cuerpo, "Georgia, serif"),
  datos: familia(marca.datos, "ui-monospace, monospace"),
};

/** Ruta del logo dentro de public/, o vacío. */
export const logo = marca.logo;
