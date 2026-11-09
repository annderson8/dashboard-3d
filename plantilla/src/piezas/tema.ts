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

const luminancia = (hex: string) => {
  const [r, g, b] = aRgb(hex).map((v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contraste = (a: string, b: string) => {
  const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const { acento, fondo, oscuro } = marca;
const gris = (t: number) => mezcla(oscuro, fondo, t);
const tinte = variante(acento, 0.55, () => 0.86);

/** El acento tal cual si se lee como texto; si no (un amarillo, un lima), el tono más cercano que sí se lee. */
const paraTexto = (hex: string) => {
  const legible = (c: string) => [fondo, "#FFFFFF", tinte].every((f) => contraste(c, f) >= 4.5);
  for (let t = 0; t < 1; t += 0.01) {
    const c = mezcla(hex, "#000000", t);
    if (legible(c)) return c;
  }
  return oscuro;
};

export const color = {
  grafito: oscuro,
  niebla: fondo,
  piedra: gris(0.315),
  acento, // superficies: maqueta, gráficas, botones. Es el color exacto de la marca
  acentoTexto: paraTexto(acento), // texto e iconos pequeños
  sobreAcento: contraste("#FFFFFF", acento) >= contraste(oscuro, acento) ? "#FFFFFF" : oscuro, // texto encima del acento
  acentoClaro: variante(acento, 0.85, (l) => Math.min(0.62, Math.max(l + 0.2, 0.46))), // acento sobre fondo oscuro
  blanco: "#FFFFFF",
  borde: gris(0.87),
  metaOscuro: gris(0.63),
  divisorOscuro: gris(0.14),
  textoSobreAcento: tinte, // tinte suave para fondos de chips e iconos
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
