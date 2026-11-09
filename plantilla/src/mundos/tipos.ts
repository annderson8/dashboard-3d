import type { LucideIcon } from "lucide-react";
import type { V3 } from "../piezas/base";
import type { Datos } from "../tablero/datos";

/** Una zona del negocio: dónde está en el 3D, cómo se llama y qué enseña su tarjeta y su panel. */
export type Zona = {
  /** Prefijo de sus claves en el CSV: `tostado` → `tostado_estado`, `tostado_temperatura`… */
  id: string;
  nombre: string;
  /** Tecla para saltar a ella (1–9). */
  tecla: string;
  icono: LucideIcon;
  /** Caja invisible que recibe el clic: centro y tamaño en unidades del mundo. */
  zona: { centro: V3; tam: V3 };
  /** Punto del que sale la línea de su tarjeta flotante. */
  ancla: V3;
  /** La cifra de su tarjeta flotante, en una línea. */
  titular: (d: Datos) => string;
  /** El contenido de su panel (debajo del estado). `historia` guarda las lecturas de las claves de `MundoTablero.historial`. */
  Panel: React.FC<{ d: Datos; historia: Record<string, number[]> }>;
};

export type Kpi = { titulo: string; valor: string; unidad?: string; nota: string };

/** Todo lo que el tablero necesita saber de un negocio. Para hacer el tuyo, copia `mundos/tostadora` y cambia esto. */
export type MundoTablero = {
  titulo: string;
  acento: string;
  zonas: Zona[];
  kpis: (d: Datos) => Kpi[];
  /** Claves numéricas cuyas lecturas se guardan para las gráficas de "últimas lecturas". */
  historial: string[];
  /** Nombre legible de cada clave para el registro de actividad. */
  nombres: Record<string, string>;
  /** Centro del plano general. */
  encuadre: V3;
  /** Tamaño del plano general (1 por defecto). Bájalo, p. ej. a 0.9, si la maqueta no cabe a lo alto. */
  escala?: number;
  /** Segundo del mundo con el que arranca (para que todo esté ya en marcha). */
  arranque: number;
  /** Las piezas 3D. `paradaDesde(id)` dice desde qué segundo está parada una zona, para congelarla. */
  Planta: React.FC<{ paradaDesde: (id: string) => number | undefined }>;
};
