import { useState } from "react";
import { Download, Search, X } from "lucide-react";
import { color, fuente } from "../piezas/tema";
import { MUNDO } from "../mundo";
import type { Fila, Guardado } from "./datos";
import { mono, tarjeta } from "./ui";

const ESTADOS = ["en marcha", "atención", "parada"];

/** Grupos del panel: una sección por zona del mundo (por el prefijo de la clave) y "General" para el resto. */
const agrupar = (filas: Fila[]) => {
  const grupos = [...MUNDO.zonas.map((z) => ({ id: z.id, nombre: z.nombre })), { id: "", nombre: "General" }].map((g) => ({
    ...g,
    filas: [] as { f: Fila; i: number }[],
  }));
  filas.forEach((f, i) => {
    const g = grupos.find((x) => x.id && f.clave.startsWith(`${x.id}_`)) ?? grupos[grupos.length - 1];
    g.filas.push({ f, i });
  });
  return grupos.filter((g) => g.filas.length);
};

const Aviso: React.FC<{ g: Guardado; alDescargar: () => void }> = ({ g, alDescargar }) => {
  const texto = g.error
    ? `No se pudo guardar: ${g.error}`
    : g.pendiente
      ? "Guardando…"
      : g.modo === "local"
        ? "Sin servidor: los cambios viven solo en esta pestaña"
        : g.hora
          ? `Guardado en datos/planta.csv · ${g.hora.toTimeString().slice(0, 8)}`
          : "Los cambios se guardan en datos/planta.csv";
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, ...mono(11, g.error ? color.grafito : color.piedra) }}>
      <span>
        {g.error ? "! " : g.pendiente ? "" : "✓ "}
        {texto}
      </span>
      <button
        onClick={alDescargar}
        title="Descargar el CSV con los cambios"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          ...mono(11, color.grafito),
          background: color.niebla,
          border: `1px solid ${color.borde}`,
          borderRadius: 8,
          padding: "5px 9px",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        <Download size={13} /> CSV
      </button>
    </div>
  );
};

/** Las filas del CSV, editables. Cada cambio se ve al instante en el tablero y se guarda en el archivo. */
export const PanelDatos: React.FC<{
  filas: Fila[];
  editar: (i: number, valor: string) => void;
  guardado: Guardado;
  alDescargar: () => void;
  alCerrar: () => void;
}> = ({ filas, editar, guardado, alDescargar, alCerrar }) => {
  const [buscar, setBuscar] = useState("");
  const q = buscar.trim().toLowerCase();
  const grupos = agrupar(filas)
    .map((g) => ({ ...g, filas: g.filas.filter(({ f }) => !q || `${f.clave} ${f.nota} ${f.valor}`.toLowerCase().includes(q)) }))
    .filter((g) => g.filas.length);
  return (
    <aside
      style={{
        ...tarjeta,
        position: "absolute",
        top: 16,
        left: 16,
        bottom: 16,
        width: 400,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 18px 50px rgba(28,30,34,0.12)",
        zIndex: 2,
      }}
    >
      <div style={{ padding: "18px 20px 12px", borderBottom: `1px solid ${color.niebla}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: fuente.titulos, fontWeight: 800, fontSize: 22, letterSpacing: -0.5 }}>Datos</div>
            <div style={mono(11)}>datos/planta.csv · {filas.length} filas</div>
          </div>
          <button
            aria-label="Cerrar"
            onClick={alCerrar}
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
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, background: color.niebla, borderRadius: 10, padding: "8px 10px" }}>
          <Search size={14} color={color.piedra} />
          <input
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Buscar una clave o un dato"
            style={{ border: "none", outline: "none", background: "transparent", width: "100%", ...mono(12, color.grafito) }}
          />
        </label>
        <div style={{ marginTop: 10 }}>
          <Aviso g={guardado} alDescargar={alDescargar} />
        </div>
      </div>
      <div style={{ overflowY: "auto", padding: "4px 20px 16px" }}>
        {grupos.map((g) => (
          <section key={g.nombre}>
            <div style={{ ...mono(11), margin: "16px 0 6px" }}>{g.nombre.toUpperCase()}</div>
            {g.filas.map(({ f, i }) => {
              const esEstado = /_estado$/.test(f.clave);
              const campo: React.CSSProperties = {
                ...mono(13, color.grafito),
                width: "100%",
                boxSizing: "border-box",
                border: `1px solid ${color.borde}`,
                borderRadius: 8,
                padding: "7px 9px",
                background: color.blanco,
                outlineColor: color.esmeralda,
              };
              return (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 150px",
                    gap: 10,
                    alignItems: "center",
                    padding: "7px 0",
                    borderBottom: `1px solid ${color.niebla}`,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: fuente.titulos,
                        fontWeight: 700,
                        fontSize: 13,
                        color: color.grafito,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={f.nota || f.clave}
                    >
                      {f.nota && !esEstado ? f.nota : f.clave.replace(/_/g, " ")}
                    </div>
                    <div style={{ ...mono(10), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={f.clave}>
                      {f.clave}
                      {f.unidad ? ` · ${f.unidad}` : ""}
                    </div>
                  </div>
                  {esEstado ? (
                    <select
                      value={ESTADOS.includes(f.valor) ? f.valor : "en marcha"}
                      onChange={(e) => editar(i, e.target.value)}
                      style={{ ...campo, cursor: "pointer" }}
                    >
                      {ESTADOS.map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={f.valor}
                      onChange={(e) => editar(i, e.target.value)}
                      inputMode={/^[-\d.,]+$/.test(f.valor) ? "decimal" : "text"}
                      style={campo}
                    />
                  )}
                </div>
              );
            })}
          </section>
        ))}
        {!grupos.length && <div style={{ ...mono(12), marginTop: 20 }}>Nada coincide con "{buscar}".</div>}
      </div>
    </aside>
  );
};
