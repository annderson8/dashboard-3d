// El tablero lee sus números de datos/planta.csv (Vite lo sirve como /datos.csv, siempre la versión guardada).
// Cambias una celda, guardas, y en ~1,5 s cambia la pantalla; si una estación pasa a "parada", su máquina se congela en el 3D.
import { useEffect, useRef, useState } from "react";
import { MUNDO } from "../mundo";

export type Estado = "en marcha" | "atención" | "parada";

type Fila = { clave: string; valor: string; unidad: string; nota: string };

/** CSV sencillo con comillas: lo que exportan Excel, Numbers o Google Sheets. */
export const leerCsv = (texto: string): Fila[] => {
  const filas: string[][] = [];
  let campo = "";
  let fila: string[] = [];
  let comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') {
        campo += '"';
        i++;
      } else if (c === '"') comillas = false;
      else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === ",") {
      fila.push(campo);
      campo = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      fila.push(campo);
      filas.push(fila);
      fila = [];
      campo = "";
    } else campo += c;
  }
  if (campo || fila.length) filas.push([...fila, campo]);
  const [cabecera, ...resto] = filas.filter((f) => f.some((x) => x.trim()));
  const col = (n: string) => cabecera.map((h) => h.trim().toLowerCase()).indexOf(n);
  const [k, v, u, no] = ["clave", "valor", "unidad", "nota"].map(col);
  if (k < 0 || v < 0) throw new Error("El CSV necesita las columnas clave y valor");
  return resto.map((f) => ({ clave: (f[k] ?? "").trim(), valor: (f[v] ?? "").trim(), unidad: u >= 0 ? (f[u] ?? "").trim() : "", nota: no >= 0 ? (f[no] ?? "").trim() : "" }));
};

export type Datos = {
  /** Primer valor de cada clave. */
  valor: (clave: string) => string;
  num: (clave: string) => number;
  serie: (clave: string) => number[];
  /** Todas las filas de una clave repetida (p. ej. almacen_stock). */
  filas: (clave: string) => Fila[];
  estado: (id: string) => Estado;
};

export const crear = (filas: Fila[]): Datos => {
  const primera = (c: string) => filas.find((f) => f.clave === c);
  return {
    valor: (c) => primera(c)?.valor ?? "",
    num: (c) => Number((primera(c)?.valor ?? "").replace(",", ".")) || 0,
    serie: (c) => (primera(c)?.valor ?? "").split(";").map((x) => Number(x.trim().replace(",", "."))).filter((x) => !Number.isNaN(x)),
    filas: (c) => filas.filter((f) => f.clave === c),
    estado: (id) => {
      const v = (primera(`${id}_estado`)?.valor ?? "").toLowerCase();
      return v.startsWith("par") ? "parada" : v.startsWith("aten") ? "atención" : "en marcha";
    },
  };
};

export type Evento = { clave: number; hora: string; texto: string; atencion: boolean };
const hora = () => new Date().toTimeString().slice(0, 8);


/** Lee el CSV cada `cada` ms, guarda el historial de lo leído y anota cada cambio como evento. */
export const useDatos = (cada = 1500) => {
  const [estado, setEstado] = useState<{ datos: Datos | null; leido: Date | null; error: string | null }>({ datos: null, leido: null, error: null });
  const [eventos, setEventos] = useState<Evento[]>([]);
  const historia = useRef<Record<string, number[]>>({});
  const anterior = useRef<Fila[] | null>(null);
  const n = useRef(0);

  useEffect(() => {
    let vivo = true;
    const leer = async () => {
      try {
        const r = await fetch(`./datos.csv?t=${Date.now()}`, { cache: "no-store" });
        if (!r.ok) throw new Error(`No encuentro datos.csv (${r.status})`);
        const filas = leerCsv(await r.text());
        if (!vivo) return;
        const nuevos: Evento[] = [];
        const prev = anterior.current;
        if (!prev) nuevos.push({ clave: n.current++, hora: hora(), texto: `Datos cargados de planta.csv (${filas.length} filas)`, atencion: false });
        else {
          for (const f of filas) {
            const p = prev.find((x) => x.clave === f.clave && x.nota === f.nota);
            if (!p || p.valor === f.valor) continue;
            const est = f.clave.match(/^(\w+)_estado$/);
            if (est) {
              const e = MUNDO.zonas.find((x) => x.id === est[1]);
              nuevos.push({ clave: n.current++, hora: hora(), texto: `${e?.nombre ?? est[1]} pasó a "${f.valor}"`, atencion: f.valor.toLowerCase() !== "en marcha" });
            } else if (f.nota && filas.filter((x) => x.clave === f.clave).length > 1) {
              nuevos.push({ clave: n.current++, hora: hora(), texto: `${MUNDO.nombres[f.clave] ?? f.clave} (${f.nota.split(",")[0]}): ${p.valor} → ${f.valor}`, atencion: false });
            } else if (!f.valor.includes(";")) {
              nuevos.push({ clave: n.current++, hora: hora(), texto: `${MUNDO.nombres[f.clave] ?? f.clave}: ${p.valor} → ${f.valor} ${f.unidad}`.trim(), atencion: false });
            }
          }
        }
        anterior.current = filas;
        const datos = crear(filas);
        for (const c of MUNDO.historial) {
          const h = (historia.current[c] ??= []);
          h.push(datos.num(c));
          if (h.length > 40) h.shift();
        }
        if (nuevos.length) setEventos((ev) => [...nuevos.reverse(), ...ev].slice(0, 8));
        setEstado({ datos, leido: new Date(), error: null });
      } catch (e) {
        if (vivo) setEstado((s) => ({ ...s, error: e instanceof Error ? e.message : String(e) }));
      }
    };
    leer();
    const id = setInterval(leer, cada);
    return () => {
      vivo = false;
      clearInterval(id);
    };
  }, [cada]);

  return { ...estado, eventos, historia: historia.current };
};
