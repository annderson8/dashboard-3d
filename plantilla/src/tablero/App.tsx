import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Table2, X } from "lucide-react";
import { color, fuente, logo } from "../piezas/tema";
import { RELOJ } from "../piezas/tiempo";
import { ANCLAS, ESTADO, Escena, type PropsMundo, type Vista } from "./Escena";
import { useDatos, type Datos, type Estado } from "./datos";
import { Kpi, mono, tarjeta } from "./ui";
import { PanelDatos } from "./PanelDatos";
import { MUNDO } from "../mundo";

type Id = string;
const ESTACIONES = MUNDO.zonas;
const estacion = (id: Id) => ESTACIONES.find((e) => e.id === id)!;

/** Hora real, una vez por segundo. */
const useReloj = () => {
  const [ahora, setAhora] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return ahora;
};

const useTam = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [tam, setTam] = useState({ w: 1200, h: 800 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setTam({ w: Math.max(320, Math.round(el.clientWidth)), h: Math.max(320, Math.round(el.clientHeight)) }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, ...tam };
};

/** Estado de una estación: icono + texto, nunca solo color. Un único acento: "atención" va en Grafito. */
const ESTILO_ESTADO: Record<Estado, { marca: string; fondo: string; tinta: string }> = {
  "en marcha": { marca: "✓", fondo: color.textoSobreAcento, tinta: color.acentoTexto },
  atención: { marca: "!", fondo: color.grafito, tinta: color.blanco },
  parada: { marca: "■", fondo: color.borde, tinta: color.grafito },
};
const ChipEstado: React.FC<{ estado: Estado }> = ({ estado }) => {
  const e = ESTILO_ESTADO[estado];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, ...mono(12, e.tinta), background: e.fondo, borderRadius: 8, padding: "4px 10px" }}>
      {e.marca} {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </span>
  );
};

/** Tarjetas a los lados con una línea punteada hasta su estación. Se actualizan en cada fotograma sin pasar por React. */
const Llamadas: React.FC<{
  d: Datos;
  seleccion: Id | null;
  hover: Id | null;
  alto: number;
  ancho: number;
  alSeleccionar: (id: Id) => void;
  alHover: (id: Id | null) => void;
  tapaIzq?: boolean;
}> = ({ d, seleccion, hover, alto, ancho, alSeleccionar, alHover, tapaIzq = false }) => {
  const lineas = useRef<Partial<Record<Id, SVGLineElement | null>>>({});
  const puntos = useRef<Partial<Record<Id, SVGCircleElement | null>>>({});
  const tarjetas = useRef<Partial<Record<Id, HTMLDivElement | null>>>({});
  const ladoRef = useRef<(id: Id) => "izq" | "der">(() => "izq");
  // Con el panel abierto, su franja deja de contar como lienzo visible.
  const limite = useRef({ ancho, alto });
  limite.current = { ancho: seleccion ? ancho - Math.min(360, ancho - 32) - 32 : ancho, alto };
  useEffect(() => {
    let raf = 0;
    const paso = () => {
      for (const e of ESTACIONES) {
        const a = ANCLAS[e.id];
        const l = lineas.current[e.id];
        const p = puntos.current[e.id];
        const t = tarjetas.current[e.id];
        if (!l || !p) continue;
        if (!a || !t) {
          l.style.display = p.style.display = "none";
          continue;
        }
        const dentro = a.x > 0 && a.y > 0 && a.x < limite.current.ancho && a.y < limite.current.alto;
        l.style.display = dentro ? "" : "none";
        p.style.display = dentro ? "" : "none";
        const caja = t.getBoundingClientRect();
        const padre = t.parentElement!.getBoundingClientRect();
        const x1 = ladoRef.current(e.id) === "izq" ? caja.right - padre.left : caja.left - padre.left;
        const y1 = caja.top - padre.top + caja.height / 2;
        l.setAttribute("x1", String(x1));
        l.setAttribute("y1", String(y1));
        l.setAttribute("x2", String(a.x));
        l.setAttribute("y2", String(a.y));
        p.setAttribute("cx", String(a.x));
        p.setAttribute("cy", String(a.y));
      }
      raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Las tres estaciones más a la izquierda en pantalla van a la columna izquierda, ordenadas de arriba abajo: así las líneas no se cruzan.
  const orden = [...ESTACIONES].sort((a, b) => (ANCLAS[a.id]?.x ?? 0) - (ANCLAS[b.id]?.x ?? 0));
  const porY = (l: typeof ESTACIONES) => [...l].sort((a, b) => (ANCLAS[a.id]?.y ?? 0) - (ANCLAS[b.id]?.y ?? 0));
  const columnas = { izq: porY(orden.slice(0, 3)), der: porY(orden.slice(3)) };
  const ladoDe = (id: Id) => (columnas.izq.some((e) => e.id === id) ? "izq" : "der");
  ladoRef.current = ladoDe;
  const columna = (lado: "izq" | "der") => columnas[lado];
  // La columna derecha termina antes: abajo está el registro de actividad.
  const huecoY = (i: number, n: number, lado: "izq" | "der") => 120 + ((alto - (lado === "der" ? 370 : 280)) / Math.max(1, n - 1)) * i;

  return (
    <>
      <svg width={ancho} height={alto} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {ESTACIONES.map((e) => {
          const fuerte = seleccion === e.id || hover === e.id;
          return (
            <g key={e.id}>
              <line
                ref={(el) => void (lineas.current[e.id] = el)}
                stroke={fuerte ? color.acentoTexto : color.piedra}
                strokeWidth={fuerte ? 2 : 1.5}
                strokeDasharray="2 5"
                strokeLinecap="round"
                opacity={fuerte ? 1 : 0.55}
              />
              <circle ref={(el) => void (puntos.current[e.id] = el)} r={fuerte ? 7 : 5} fill={color.acento} stroke={color.blanco} strokeWidth={2.5} />
            </g>
          );
        })}
      </svg>
      {(["izq", "der"] as const).map((lado) =>
        // Con el panel abierto, la columna derecha quedaría debajo: no se pinta.
        ((seleccion && lado === "der") || (tapaIzq && lado === "izq") ? [] : columna(lado)).map((e, i, arr) => {
          const Icono = e.icono;
          const fuerte = seleccion === e.id || hover === e.id;
          return (
            <div
              key={e.id}
              ref={(el) => void (tarjetas.current[e.id] = el)}
              onClick={() => alSeleccionar(e.id)}
              onPointerEnter={() => alHover(e.id)}
              onPointerLeave={() => alHover(null)}
              style={{
                ...tarjeta,
                position: "absolute",
                top: huecoY(i, arr.length, lado),
                [lado === "izq" ? "left" : "right"]: 20,
                width: 196,
                padding: "10px 14px",
                cursor: "pointer",
                borderColor: fuerte ? color.acento : color.borde,
                boxShadow: fuerte ? `0 0 0 2px ${color.acento}` : "0 6px 20px rgba(28,30,34,0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7, ...mono(11) }}>
                <Icono size={13} color={color.acentoTexto} strokeWidth={2.2} />
                {e.nombre.toUpperCase()}
                {d.estado(e.id) !== "en marcha" && (
                  <span
                    style={{
                      marginLeft: "auto",
                      ...mono(10, ESTILO_ESTADO[d.estado(e.id)].tinta),
                      background: ESTILO_ESTADO[d.estado(e.id)].fondo,
                      borderRadius: 5,
                      padding: "1px 6px",
                    }}
                  >
                    {ESTILO_ESTADO[d.estado(e.id)].marca} {d.estado(e.id).toUpperCase()}
                  </span>
                )}
              </div>
              <div
                style={{
                  fontFamily: fuente.titulos,
                  fontWeight: 800,
                  fontSize: 21,
                  letterSpacing: -0.5,
                  color: d.estado(e.id) === "parada" ? color.piedra : color.grafito,
                  marginTop: 3,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {e.titular(d)}
              </div>
            </div>
          );
        }),
      )}
    </>
  );
};

const EnVivo: React.FC = () => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 7, ...mono(11, color.acentoTexto), fontWeight: 500 }}>
    <span style={{ width: 8, height: 8, borderRadius: 4, background: color.acento, boxShadow: `0 0 0 4px ${color.textoSobreAcento}` }} />
    EN VIVO
  </span>
);

export const App: React.FC = () => {
  const { datos: d, filas, leido, error, eventos, historia, editar, guardado, descargar } = useDatos();
  const [verDatos, setVerDatos] = useState(false);
  const ahora = useReloj();
  const lienzo = useTam();
  const base = Math.min(lienzo.w / 30, lienzo.h / 22) * (MUNDO.escala ?? 1);
  const GENERAL: Vista = useMemo(() => ({ a: MUNDO.encuadre, az: 46, elev: 35, zoom: base }), [base]);
  const [vista, setVista] = useState<Vista>(GENERAL);
  const [seleccion, setSeleccion] = useState<Id | null>(null);
  const [hover, setHover] = useState<Id | null>(null);
  const arrastre = useRef<{ x: number; y: number; az: number; elev: number } | null>(null);

  useEffect(() => setVista((v) => (seleccion ? v : { ...v, zoom: base })), [base, seleccion]);

  const ir = useCallback(
    (id: Id | null) => {
      setSeleccion(id);
      if (!id) return setVista({ ...GENERAL });
      const e = estacion(id);
      setVista((v) => ({ a: [e.zona.centro[0], e.zona.centro[1] * 0.6, e.zona.centro[2]], az: v.az, elev: 32, zoom: base * 2.3 }));
    },
    [GENERAL, base],
  );

  useEffect(() => {
    const tecla = (ev: KeyboardEvent) => {
      if (ev.target instanceof HTMLElement && ev.target.closest("input, select, textarea")) return;
      if (ev.key === "Escape" || ev.key === "0") ir(null);
      const e = ESTACIONES.find((x) => x.tecla === ev.key);
      if (e) ir(e.id);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [ir]);

  useEffect(() => {
    document.body.style.cursor = hover ? "pointer" : "";
  }, [hover]);

  // La escena lee esto en cada fotograma; se escribe antes de pintar para que no haya ni un fotograma de retraso.
  useLayoutEffect(() => {
    ESTADO.vista = vista;
    ESTADO.seleccion = seleccion;
    ESTADO.hover = hover;
  }, [vista, seleccion, hover]);
  useEffect(() => {
    if (!d) return;
    const s = RELOJ.ahora;
    for (const e of ESTACIONES) {
      const parada = d.estado(e.id) === "parada";
      if (parada && ESTADO.paradas[e.id] === undefined) ESTADO.paradas[e.id] = s;
      if (!parada) delete ESTADO.paradas[e.id];
    }
  }, [d]);
  const props: PropsMundo = useMemo(() => ({ alSeleccionar: ir, alHover: setHover }), [ir]);
  const sel = seleccion ? estacion(seleccion) : null;
  const Icono = sel ? sel.icono : null;

  return (
    <div style={{ height: "100vh", display: "grid", gridTemplateRows: "auto auto 1fr", background: color.niebla, color: color.grafito, overflow: "hidden" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, minWidth: 0 }}>
          {logo && <img src={`./${logo}`} alt="" style={{ height: 28, display: "block" }} />}
          <span style={{ fontFamily: fuente.titulos, fontWeight: 800, fontSize: 24, letterSpacing: -0.5, whiteSpace: "nowrap" }}>
            {MUNDO.titulo} <span style={{ color: color.acentoTexto }}>{MUNDO.acento}</span>
          </span>
          <span style={{ ...mono(11), whiteSpace: "nowrap" }}>
            {error ? `⚠ ${error}` : leido ? `DATOS LEÍDOS ${leido.toTimeString().slice(0, 8)}` : "LEYENDO DATOS…"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <button
            onClick={() => setVerDatos((v) => !v)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              ...mono(12, verDatos ? color.sobreAcento : color.grafito),
              background: verDatos ? color.acento : color.blanco,
              border: `1px solid ${verDatos ? color.acento : color.borde}`,
              borderRadius: 10,
              padding: "7px 12px",
              cursor: "pointer",
            }}
          >
            <Table2 size={14} /> Datos
          </button>
          <EnVivo />
          <span style={mono(14, color.grafito)}>{ahora.toTimeString().slice(0, 8)}</span>
        </div>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, padding: "14px 24px" }}>
        {d && MUNDO.kpis(d).map((k) => <Kpi key={k.titulo} {...k} />)}
      </section>

      <main
        style={{
          position: "relative",
          margin: "0 24px 24px",
          borderRadius: 20,
          overflow: "hidden",
          border: `1px solid ${color.borde}`,
          background: color.niebla,
        }}
      >
        <div
          ref={lienzo.ref}
          style={{ position: "absolute", inset: 0, touchAction: "none" }}
          onPointerDown={(ev) => (arrastre.current = { x: ev.clientX, y: ev.clientY, az: vista.az, elev: vista.elev })}
          onPointerMove={(ev) => {
            const a = arrastre.current;
            if (!a || !ev.buttons) return;
            setVista((v) => ({ ...v, rapido: true, az: a.az - (ev.clientX - a.x) * 0.3, elev: Math.min(72, Math.max(14, a.elev + (ev.clientY - a.y) * 0.2)) }));
          }}
          onPointerUp={() => (arrastre.current = null)}
          onWheel={(ev) => setVista((v) => ({ ...v, rapido: true, zoom: Math.min(base * 4, Math.max(base * 0.6, v.zoom * Math.exp(-ev.deltaY * 0.0012))) }))}
        >
          <Escena {...props} />
        </div>

        {d && lienzo.w > 900 && (
          <Llamadas d={d} seleccion={seleccion} hover={hover} alto={lienzo.h} ancho={lienzo.w} alSeleccionar={ir} alHover={setHover} tapaIzq={verDatos} />
        )}

        {verDatos && d && <PanelDatos filas={filas} editar={editar} guardado={guardado} alDescargar={descargar} alCerrar={() => setVerDatos(false)} />}

        <nav style={{ position: "absolute", left: verDatos ? 432 : 16, bottom: 16, display: "flex", flexWrap: "wrap", gap: 6, maxWidth: "calc(100% - 32px)" }}>
          {[{ id: null, nombre: "General", tecla: "0" }, ...ESTACIONES].map((e) => {
            const activo = seleccion === e.id;
            return (
              <button
                key={e.nombre}
                onClick={() => ir(e.id)}
                style={{
                  ...mono(12, activo ? color.sobreAcento : color.grafito),
                  background: activo ? color.acento : color.blanco,
                  border: `1px solid ${activo ? color.acento : color.borde}`,
                  borderRadius: 10,
                  padding: "8px 12px",
                  cursor: "pointer",
                }}
              >
                <span style={{ opacity: 0.6, marginRight: 6 }}>{e.tecla}</span>
                {e.nombre}
              </button>
            );
          })}
        </nav>

        {!sel && lienzo.w > 700 && (
          <div style={{ ...tarjeta, position: "absolute", right: 16, bottom: 16, width: 300, padding: "12px 16px" }}>
            <div style={{ ...mono(11), marginBottom: 6 }}>ACTIVIDAD</div>
            {eventos.slice(0, 4).map((ev) => (
              <div key={ev.clave} style={{ display: "flex", gap: 10, padding: "6px 0", borderTop: `1px solid ${color.niebla}`, alignItems: "baseline" }}>
                <span style={mono(11)}>{ev.hora}</span>
                <span style={{ fontFamily: fuente.titulos, fontWeight: 700, fontSize: 13, color: color.grafito, lineHeight: 1.3 }}>
                  {ev.atencion && (
                    <span style={{ ...mono(11, color.blanco), background: color.grafito, borderRadius: 4, padding: "0 5px", marginRight: 6 }}>!</span>
                  )}
                  {ev.texto}
                </span>
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 14,
            translate: "-50% 0",
            ...mono(11),
            background: color.blanco,
            border: `1px solid ${color.borde}`,
            borderRadius: 999,
            padding: "6px 14px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          Arrastra para girar · rueda para acercar · clic en una zona
        </div>

        {sel && Icono && (
          <aside
            style={{
              ...tarjeta,
              position: "absolute",
              top: 16,
              right: 16,
              bottom: 16,
              width: Math.min(360, lienzo.w - 32),
              padding: 22,
              overflowY: "auto",
              boxShadow: "0 18px 50px rgba(28,30,34,0.12)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 40, height: 40, borderRadius: 12, background: color.textoSobreAcento, display: "grid", placeItems: "center" }}>
                  <Icono size={20} color={color.acentoTexto} strokeWidth={2.2} />
                </span>
                <div>
                  <div style={{ fontFamily: fuente.titulos, fontWeight: 800, fontSize: 24, letterSpacing: -0.5 }}>{sel.nombre}</div>
                  <EnVivo />
                </div>
              </div>
              <button
                aria-label="Cerrar"
                onClick={() => ir(null)}
                style={{
                  border: "none",
                  background: color.niebla,
                  borderRadius: 10,
                  width: 34,
                  height: 34,
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                }}
              >
                <X size={16} color={color.grafito} />
              </button>
            </div>
            {d && (
              <>
                <div style={{ marginTop: 16, marginBottom: 6 }}>
                  <ChipEstado estado={d.estado(sel.id)} />
                </div>
                <sel.Panel d={d} historia={historia} />
              </>
            )}
          </aside>
        )}
      </main>
    </div>
  );
};
