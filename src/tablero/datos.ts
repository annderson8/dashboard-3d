// El tablero lee sus números de datos/planta.csv (Vite lo sirve como /datos.csv, siempre la versión guardada).
// Cambias una celda, guardas, y en ~1,5 s cambia la pantalla; si una estación pasa a "parada", su máquina se congela en el 3D.
import { useCallback, useEffect, useRef, useState } from "react";
import { MUNDO } from "../mundo";

export type Estado = "en marcha" | "atención" | "parada";

export type Fila = { clave: string; valor: string; unidad: string; nota: string };

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
  return resto.map((f) => ({
    clave: (f[k] ?? "").trim(),
    valor: (f[v] ?? "").trim(),
    unidad: u >= 0 ? (f[u] ?? "").trim() : "",
    nota: no >= 0 ? (f[no] ?? "").trim() : "",
  }));
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
    serie: (c) =>
      (primera(c)?.valor ?? "")
        .split(";")
        .map((x) => Number(x.trim().replace(",", ".")))
        .filter((x) => !Number.isNaN(x)),
    filas: (c) => filas.filter((f) => f.clave === c),
    estado: (id) => {
      const v = (primera(`${id}_estado`)?.valor ?? "").toLowerCase();
      return v.startsWith("par") ? "parada" : v.startsWith("aten") ? "atención" : "en marcha";
    },
  };
};

export type Evento = { clave: number; hora: string; texto: string; atencion: boolean };
const hora = () => new Date().toTimeString().slice(0, 8);

/** Vuelve a escribir el CSV, con comillas donde hacen falta. */
export const escribirCsv = (filas: Fila[]) => {
  const campo = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return ["clave,valor,unidad,nota", ...filas.map((f) => [f.clave, f.valor, f.unidad, f.nota].map(campo).join(","))].join("\n") + "\n";
};

/** Qué cambió entre dos versiones del archivo, como eventos para el registro. */
const diferencias = (prev: Fila[], filas: Fila[], n: { current: number }): Evento[] => {
  const nuevos: Evento[] = [];
  for (const f of filas) {
    const p = prev.find((x) => x.clave === f.clave && x.nota === f.nota);
    if (!p || p.valor === f.valor) continue;
    const est = f.clave.match(/^(\w+)_estado$/);
    if (est) {
      const e = MUNDO.zonas.find((x) => x.id === est[1]);
      nuevos.push({ clave: n.current++, hora: hora(), texto: `${e?.nombre ?? est[1]} pasó a "${f.valor}"`, atencion: f.valor.toLowerCase() !== "en marcha" });
    } else if (f.nota && filas.filter((x) => x.clave === f.clave).length > 1) {
      nuevos.push({
        clave: n.current++,
        hora: hora(),
        texto: `${MUNDO.nombres[f.clave] ?? f.clave} (${f.nota.split(",")[0]}): ${p.valor} → ${f.valor}`,
        atencion: false,
      });
    } else if (!f.valor.includes(";")) {
      nuevos.push({
        clave: n.current++,
        hora: hora(),
        texto: `${MUNDO.nombres[f.clave] ?? f.clave}: ${p.valor} → ${f.valor} ${f.unidad}`.trim(),
        atencion: false,
      });
    }
  }
  return nuevos;
};

/** Dónde acaban los cambios del panel: en el archivo (npm run dev) o solo en esta pestaña (versión estática). */
export type Guardado = { modo: "archivo" | "local"; hora: Date | null; pendiente: boolean; error: string | null };

/**
 * Lee el CSV cada `cada` ms, guarda el historial de lo leído y anota cada cambio como evento.
 * `editar` cambia una celda al momento y la guarda en el archivo medio segundo después de la última tecla.
 */
export const useDatos = (cada = 1500) => {
  const [estado, setEstado] = useState<{ datos: Datos | null; filas: Fila[]; leido: Date | null; error: string | null }>({
    datos: null,
    filas: [],
    leido: null,
    error: null,
  });
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [guardado, setGuardado] = useState<Guardado>({ modo: "archivo", hora: null, pendiente: false, error: null });
  const historia = useRef<Record<string, number[]>>({});
  const anterior = useRef<Fila[] | null>(null); // última versión ya anotada en el registro
  const actuales = useRef<Fila[]>([]);
  const ocupado = useRef(false); // hay cambios sin guardar: la lectura periódica no los pisa
  const local = useRef(false);
  const espera = useRef<number | undefined>(undefined);
  const n = useRef(0);

  const anotar = useCallback((filas: Fila[]) => {
    const prev = anterior.current;
    const nuevos = prev
      ? diferencias(prev, filas, n)
      : [{ clave: n.current++, hora: hora(), texto: `Datos cargados de planta.csv (${filas.length} filas)`, atencion: false }];
    anterior.current = filas;
    if (nuevos.length) setEventos((ev) => [...nuevos.reverse(), ...ev].slice(0, 8));
  }, []);

  const mostrar = useCallback((filas: Fila[], leido: boolean) => {
    actuales.current = filas;
    const datos = crear(filas);
    if (leido) {
      for (const c of MUNDO.historial) {
        const h = (historia.current[c] ??= []);
        h.push(datos.num(c));
        if (h.length > 40) h.shift();
      }
    }
    setEstado((s) => ({ datos, filas, leido: leido ? new Date() : s.leido, error: null }));
  }, []);

  useEffect(() => {
    let vivo = true;
    const leer = async () => {
      if (ocupado.current || local.current) return;
      try {
        const r = await fetch(`./datos.csv?t=${Date.now()}`, { cache: "no-store" });
        if (!r.ok) throw new Error(`No encuentro datos.csv (${r.status})`);
        const filas = leerCsv(await r.text());
        if (!vivo || ocupado.current) return;
        anotar(filas);
        mostrar(filas, true);
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
  }, [cada, anotar, mostrar]);

  const guardar = useCallback(async () => {
    const filas = actuales.current;
    anotar(filas);
    if (local.current) {
      ocupado.current = false;
      setGuardado({ modo: "local", hora: new Date(), pendiente: false, error: null });
      return;
    }
    try {
      const r = await fetch("./datos.csv", { method: "POST", headers: { "Content-Type": "text/csv" }, body: escribirCsv(filas) });
      if (r.status === 400) {
        const error = await r.text();
        setGuardado((g) => ({ ...g, pendiente: false, error }));
      } else if (r.headers.get("X-Tablero-Guardado") === "si") {
        setGuardado({ modo: "archivo", hora: new Date(), pendiente: false, error: null });
      } else {
        // Cualquier otra respuesta es un servidor que no escribe (la versión estática): los cambios se quedan en la pestaña.
        local.current = true;
        setGuardado({ modo: "local", hora: new Date(), pendiente: false, error: null });
      }
    } catch (e) {
      setGuardado((g) => ({ ...g, pendiente: false, error: e instanceof Error ? e.message : String(e) }));
    } finally {
      ocupado.current = false;
    }
  }, [anotar]);

  const editar = useCallback(
    (i: number, valor: string) => {
      const filas = actuales.current.map((f, k) => (k === i ? { ...f, valor } : f));
      ocupado.current = true;
      mostrar(filas, false);
      setGuardado((g) => ({ ...g, pendiente: true }));
      window.clearTimeout(espera.current);
      espera.current = window.setTimeout(guardar, 500);
    },
    [mostrar, guardar],
  );

  const descargar = useCallback(() => {
    const url = URL.createObjectURL(new Blob([escribirCsv(actuales.current)], { type: "text/csv;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "planta.csv" });
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return { ...estado, eventos, historia: historia.current, editar, guardado, descargar };
};
