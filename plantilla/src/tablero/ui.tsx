// Piezas de interfaz del tablero, para usarlas desde los paneles de cada mundo.
import { color, fuente } from "../piezas/tema";

/** 1.284,5: siempre con punto de miles, también en cifras de cuatro dígitos. */
export const num = (v: number, d = 0) => {
  const [ent, dec] = Math.abs(v).toFixed(d).split(".");
  const miles = ent.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${v < 0 ? "-" : ""}${miles}${dec ? `,${dec}` : ""}`;
};

export const mono = (size: number, tinta: string = color.piedra): React.CSSProperties => ({
  fontFamily: fuente.datos,
  fontSize: size,
  color: tinta,
  letterSpacing: 0.5,
  fontVariantNumeric: "tabular-nums",
});
export const tarjeta: React.CSSProperties = { background: color.blanco, border: `1px solid ${color.borde}`, borderRadius: 16 };

export const Kpi: React.FC<{ titulo: string; valor: string; unidad?: string; nota: string }> = ({ titulo, valor, unidad, nota }) => (
  <div style={{ ...tarjeta, padding: "14px 18px", minWidth: 0 }}>
    <div style={mono(11)}>{titulo.toUpperCase()}</div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
      <span style={{ fontFamily: fuente.titulos, fontWeight: 800, fontSize: 30, letterSpacing: -1, color: color.grafito, fontVariantNumeric: "tabular-nums" }}>
        {valor}
      </span>
      {unidad && <span style={mono(13)}>{unidad}</span>}
    </div>
    <div style={{ ...mono(11), marginTop: 4 }}>{nota}</div>
  </div>
);

export const Dato: React.FC<{ etiqueta: string; valor: string }> = ({ etiqueta, valor }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${color.niebla}` }}>
    <span style={{ fontFamily: fuente.titulos, fontWeight: 700, fontSize: 14, color: color.piedra }}>{etiqueta}</span>
    <span style={mono(14, color.grafito)}>{valor}</span>
  </div>
);

export const Titulo: React.FC<{ texto: string }> = ({ texto }) => <div style={{ ...mono(11), margin: "20px 0 10px" }}>{texto.toUpperCase()}</div>;
