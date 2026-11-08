import { useState } from "react";
import { color, fuente } from "../piezas/tema";

// Gráficas de una sola serie en el acento de marca: línea de 2 px, rejilla discreta y tooltip al pasar el puntero.
const mono = { fontFamily: fuente.datos, fontSize: 11, fill: color.piedra } as const;

type Base = { alto?: number; formato: (v: number) => string; etiquetaX: (i: number) => string };

const Tooltip: React.FC<{ x: number; y: number; titulo: string; valor: string; ancho: number }> = ({ x, y, titulo, valor, ancho }) => {
  const w = 108;
  const izq = Math.min(Math.max(x - w / 2, 0), ancho - w);
  return (
    <g transform={`translate(${izq} ${Math.max(0, y - 52)})`} pointerEvents="none">
      <rect width={w} height={42} rx={8} fill={color.grafito} />
      <text x={10} y={16} style={{ ...mono, fill: color.metaOscuro }}>{titulo}</text>
      <text x={10} y={33} style={{ fontFamily: fuente.datos, fontSize: 14, fontWeight: 500, fill: color.niebla }}>{valor}</text>
    </g>
  );
};

/** `total`: puntos que caben en el eje aunque aún no haya datos (la curva se va dibujando hacia la derecha). */
export const Linea: React.FC<Base & { valores: number[]; min?: number; max?: number; ancho?: number; total?: number }> = ({ valores, alto = 150, ancho = 320, formato, etiquetaX, min, max, total }) => {
  const [encima, setEncima] = useState<number | null>(null);
  const pad = { l: 34, r: 8, t: 10, b: 20 };
  const lo = min ?? Math.min(...valores);
  const hi = max ?? Math.max(...valores);
  const n = Math.max(total ?? valores.length, valores.length);
  const x = (i: number) => pad.l + (i / Math.max(1, n - 1)) * (ancho - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - lo) / (hi - lo || 1)) * (alto - pad.t - pad.b);
  const ruta = valores.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const ultimo = valores.length - 1;
  const marcas = [lo, (lo + hi) / 2, hi];
  return (
    <svg
      width="100%"
      viewBox={`0 0 ${ancho} ${alto}`}
      onPointerMove={(ev) => {
        const r = ev.currentTarget.getBoundingClientRect();
        const px = ((ev.clientX - r.left) / r.width) * ancho;
        setEncima(Math.min(ultimo, Math.round(((px - pad.l) / (ancho - pad.l - pad.r)) * (n - 1))));
      }}
      onPointerLeave={() => setEncima(null)}
      style={{ display: "block", touchAction: "none" }}
    >
      {marcas.map((m) => (
        <g key={m}>
          <line x1={pad.l} x2={ancho - pad.r} y1={y(m)} y2={y(m)} stroke={color.borde} strokeWidth={1} />
          <text x={pad.l - 6} y={y(m) + 4} textAnchor="end" style={mono}>{formato(m)}</text>
        </g>
      ))}
      <text x={pad.l} y={alto - 4} style={mono}>{etiquetaX(0)}</text>
      <text x={ancho - pad.r} y={alto - 4} textAnchor="end" style={mono}>{etiquetaX(n - 1)}</text>
      <path d={ruta} fill="none" stroke={color.esmeralda} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(ultimo)} cy={y(valores[ultimo])} r={4.5} fill={color.esmeralda} stroke={color.blanco} strokeWidth={2} />
      {encima !== null && encima >= 0 && encima <= ultimo && (
        <>
          <line x1={x(encima)} x2={x(encima)} y1={pad.t} y2={alto - pad.b} stroke={color.piedra} strokeWidth={1} strokeDasharray="3 3" />
          <circle cx={x(encima)} cy={y(valores[encima])} r={4.5} fill={color.esmeralda} stroke={color.blanco} strokeWidth={2} />
          <Tooltip x={x(encima)} y={y(valores[encima])} titulo={etiquetaX(encima)} valor={formato(valores[encima])} ancho={ancho} />
        </>
      )}
    </svg>
  );
};

export const Barras: React.FC<Base & { valores: number[]; ancho?: number }> = ({ valores, alto = 150, ancho = 320, formato, etiquetaX }) => {
  const [encima, setEncima] = useState<number | null>(null);
  const pad = { l: 34, r: 8, t: 10, b: 20 };
  const hi = Math.max(...valores) || 1;
  const banda = (ancho - pad.l - pad.r) / valores.length;
  const base = alto - pad.b;
  const y = (v: number) => pad.t + (1 - v / hi) * (base - pad.t);
  return (
    <svg width="100%" viewBox={`0 0 ${ancho} ${alto}`} style={{ display: "block" }} onPointerLeave={() => setEncima(null)}>
      {[0, hi / 2, hi].map((m) => (
        <g key={m}>
          <line x1={pad.l} x2={ancho - pad.r} y1={y(m)} y2={y(m)} stroke={color.borde} strokeWidth={1} />
          <text x={pad.l - 6} y={y(m) + 4} textAnchor="end" style={mono}>{formato(m)}</text>
        </g>
      ))}
      {valores.map((v, i) => {
        const bx = pad.l + i * banda + 1;
        const w = banda - 2;
        const top = y(v);
        const h = Math.max(0, base - top);
        const r = Math.min(4, w / 2, h);
        return (
          <g key={i} onPointerEnter={() => setEncima(i)}>
            <rect x={bx - 1} y={pad.t} width={banda} height={base - pad.t} fill="transparent" />
            {h > 0 && <path d={`M${bx} ${base} V${top + r} Q${bx} ${top} ${bx + r} ${top} H${bx + w - r} Q${bx + w} ${top} ${bx + w} ${top + r} V${base} Z`} fill={color.esmeralda} opacity={encima === null || encima === i ? 1 : 0.45} />}
            {(i === 0 || i === valores.length - 1) && <text x={bx + w / 2} y={alto - 4} textAnchor="middle" style={mono}>{etiquetaX(i)}</text>}
          </g>
        );
      })}
      <line x1={pad.l} x2={ancho - pad.r} y1={base} y2={base} stroke={color.piedra} strokeWidth={1} />
      {encima !== null && <Tooltip x={pad.l + (encima + 0.5) * banda} y={y(valores[encima])} titulo={etiquetaX(encima)} valor={formato(valores[encima])} ancho={ancho} />}
    </svg>
  );
};

/** Barras horizontales con la etiqueta y el valor escritos: no hace falta leyenda. */
export const Ranking: React.FC<{ filas: { nombre: string; valor: number }[]; formato: (v: number) => string }> = ({ filas, formato }) => {
  const hi = Math.max(...filas.map((f) => f.valor));
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {filas.map((f) => (
        <div key={f.nombre} title={`${f.nombre}: ${formato(f.valor)}`}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: fuente.datos, fontSize: 12, color: color.piedra, marginBottom: 4 }}>
            <span>{f.nombre}</span>
            <span style={{ color: color.grafito }}>{formato(f.valor)}</span>
          </div>
          <div style={{ height: 10, background: color.niebla, borderRadius: 5 }}>
            <div style={{ width: `${(f.valor / hi) * 100}%`, height: "100%", background: color.esmeralda, borderRadius: 5 }} />
          </div>
        </div>
      ))}
    </div>
  );
};
