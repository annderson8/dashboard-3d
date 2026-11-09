// La tostadora de café: el mundo de ejemplo. Para tu negocio, copia esta carpeta y cambia zonas, cifras y piezas.
import { Boxes, Flame, Package, Snowflake, Truck, Warehouse } from "lucide-react";
import { Congela } from "../../piezas/base";
import { color } from "../../piezas/tema";
import { Barras, Linea, Ranking } from "../../tablero/Grafica";
import { Dato, num, Titulo } from "../../tablero/ui";
import type { Datos } from "../../tablero/datos";
import type { MundoTablero } from "../tipos";
import { LineaBolsas } from "./bolsas";
import { Entorno } from "./entorno";
import { Camion, Empacadora, Enfriado, Recepcion, Tostadora } from "./maquinas";

// Ayudas comunes de los paneles.
const ayudas = (d: Datos, historia: Record<string, number[]>) => {
  const u = (c: string, dec = 0, sufijo = "") => `${num(d.num(c), dec)}${sufijo}`;
  const lecturas = (c: string) => (historia[c]?.length ? historia[c] : [d.num(c)]);
  const etiquetaLectura = (total: number) => (i: number) => (i === total - 1 ? "ahora" : `-${((total - 1 - i) * 1.5).toFixed(0)} s`);
  return { u, lecturas, etiquetaLectura };
};

const Panel_recepcion: MundoTablero["zonas"][number]["Panel"] = ({ d, historia }) => {
  const { u } = ayudas(d, historia);
  const serie = d.serie("recepcion_kg_por_hora");
  return (
    <>
      <Dato etiqueta="Lotes recibidos hoy" valor={u("recepcion_lotes_hoy")} />
      <Dato etiqueta="Café verde en foso" valor={u("recepcion_foso", 0, " kg")} />
      <Dato etiqueta="Humedad" valor={u("recepcion_humedad", 1, " %")} />
      <Dato etiqueta="Último origen" valor={d.valor("recepcion_origen")} />
      <Titulo texto="Kilos recibidos por hora" />
      {serie.length > 0 && <Barras valores={serie} formato={(v) => num(v)} etiquetaX={(i) => `${String(3 + i).padStart(2, "0")}:00`} />}
    </>
  );
};

const Panel_tostado: MundoTablero["zonas"][number]["Panel"] = ({ d, historia }) => {
  const { u } = ayudas(d, historia);
  const curva = d.serie("tostado_curva");
  return (
    <>
      <Dato etiqueta="Lote en el tambor" valor={`#${d.valor("tostado_lote")}`} />
      <Dato etiqueta="Temperatura" valor={u("tostado_temperatura", 1, " °C")} />
      <Dato etiqueta="Minuto del lote" valor={`${u("tostado_minuto", 1)} de 12`} />
      <Dato etiqueta="Pérdida de peso esperada" valor={u("tostado_perdida_peso", 0, " %")} />
      <Titulo texto={`Curva del lote #${d.valor("tostado_lote")}`} />
      {curva.length > 1 && <Linea valores={curva} total={13} min={80} max={215} formato={(v) => `${num(v)}°`} etiquetaX={(i) => `min ${i}`} />}
    </>
  );
};

const Panel_enfriado: MundoTablero["zonas"][number]["Panel"] = ({ d, historia }) => {
  const { u, lecturas, etiquetaLectura } = ayudas(d, historia);
  const h = lecturas("enfriado_temperatura");
  return (
    <>
      <Dato etiqueta="Temperatura del grano" valor={u("enfriado_temperatura", 1, " °C")} />
      <Dato etiqueta="Objetivo" valor={`< ${u("enfriado_objetivo")} °C`} />
      <Titulo texto="Temperatura del grano, lecturas" />
      <Linea valores={h.length > 1 ? h : [h[0], h[0]]} total={40} formato={(v) => `${num(v)}°`} etiquetaX={etiquetaLectura(40)} />
    </>
  );
};

const Panel_empaque: MundoTablero["zonas"][number]["Panel"] = ({ d, historia }) => {
  const { u, lecturas, etiquetaLectura } = ayudas(d, historia);
  const h = lecturas("empaque_bolsas_minuto");
  return (
    <>
      <Dato etiqueta="Ritmo" valor={u("empaque_bolsas_minuto", 0, " bolsas/min")} />
      <Dato etiqueta="Peso medio" valor={u("empaque_peso_medio", 1, " g")} />
      <Dato etiqueta="Rechazos" valor={u("empaque_rechazos", 1, " %")} />
      <Titulo texto="Bolsas por minuto, últimas lecturas" />
      <Barras valores={h.slice(-12)} formato={(v) => num(v)} etiquetaX={etiquetaLectura(Math.min(12, h.length))} />
    </>
  );
};

const Panel_paletizado: MundoTablero["zonas"][number]["Panel"] = ({ d, historia }) => {
  const { u } = ayudas(d, historia);
  const n = Math.max(0, Math.min(18, Math.round(d.num("paletizado_en_tarima"))));
  return (
    <>
      <Dato etiqueta="Tarimas hoy" valor={u("tarimas_listas")} />
      <Dato etiqueta="Próximo envío" valor={d.valor("proximo_envio")} />
      <Titulo texto={`Tarima en carga · ${n} de 18 bolsas`} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4 }}>
        {Array.from({ length: 18 }, (_, i) => (
          <div key={i} style={{ height: 22, borderRadius: 4, background: i < n ? color.acento : color.niebla }} />
        ))}
      </div>
    </>
  );
};

const Panel_almacen: MundoTablero["zonas"][number]["Panel"] = ({ d, historia }) => {
  const { u } = ayudas(d, historia);
  const stock = d.filas("almacen_stock").map((f) => ({ nombre: f.nota || "Sin origen", valor: Number(f.valor) || 0 }));
  return (
    <>
      <Dato etiqueta="Bolsas en stock" valor={num(stock.reduce((a, b) => a + b.valor, 0))} />
      <Dato etiqueta="Cobertura" valor={u("almacen_cobertura", 0, " días")} />
      <Titulo texto="Stock por origen" />
      {stock.length > 0 && <Ranking filas={stock} formato={(v) => num(v)} />}
    </>
  );
};

export const tostadora: MundoTablero = {
  titulo: "Tostadora",
  acento: "Planta 1",
  encuadre: [-0.6, 3, -1.8],
  escala: 0.85,
  arranque: 22,
  zonas: [
    {
      id: "recepcion",
      nombre: "Recepción",
      tecla: "1",
      icono: Truck,
      zona: { centro: [-12.4, 1.5, -10], tam: [4.6, 3, 4] },
      ancla: [-12.7, 1.4, -10],
      titular: (d) => `${num(d.num("recepcion_humedad"), 1)} % humedad`,
      Panel: Panel_recepcion,
    },
    {
      id: "tostado",
      nombre: "Tostado",
      tecla: "2",
      icono: Flame,
      zona: { centro: [-2.3, 4, -10.2], tam: [5.6, 8, 5] },
      ancla: [-2.6, 7.6, -10],
      titular: (d) => `${num(d.num("tostado_temperatura"))} °C`,
      Panel: Panel_tostado,
    },
    {
      id: "enfriado",
      nombre: "Enfriado",
      tecla: "3",
      icono: Snowflake,
      zona: { centro: [-2.6, 1, -4], tam: [6, 2.4, 5.4] },
      ancla: [-2.6, 2, -4],
      titular: (d) => `${num(d.num("enfriado_temperatura"))} °C grano`,
      Panel: Panel_enfriado,
    },
    {
      id: "empaque",
      nombre: "Empaque",
      tecla: "4",
      icono: Package,
      zona: { centro: [9, 3, -1.6], tam: [4.6, 6.2, 12] },
      ancla: [9, 8.1, -4],
      titular: (d) => `${num(d.num("empaque_bolsas_minuto"))} bolsas/min`,
      Panel: Panel_empaque,
    },
    {
      id: "paletizado",
      nombre: "Paletizado",
      tecla: "5",
      icono: Boxes,
      zona: { centro: [6.2, 1.5, 7.6], tam: [9.4, 3, 5] },
      ancla: [4, 3.4, 7.8],
      titular: (d) => `${num(d.num("paletizado_en_tarima"))}/18 en tarima`,
      Panel: Panel_paletizado,
    },
    {
      id: "almacen",
      nombre: "Almacén",
      tecla: "6",
      icono: Warehouse,
      zona: { centro: [-9.3, 1.6, 1.8], tam: [8.8, 3.4, 5.8] },
      ancla: [-9.3, 3.5, 1.8],
      titular: (d) => `${num(d.filas("almacen_stock").reduce((a, f) => a + (Number(f.valor) || 0), 0))} bolsas`,
      Panel: Panel_almacen,
    },
  ],
  kpis: (d) => [
    { titulo: "Café tostado hoy", valor: num(d.num("cafe_tostado_hoy")), unidad: "kg", nota: `meta ${num(d.num("meta_cafe_tostado"))} kg` },
    { titulo: "Bolsas empacadas", valor: num(d.num("bolsas_empacadas")), nota: "bolsas de 250 g" },
    { titulo: "Temperatura del tambor", valor: num(d.num("tostado_temperatura")), unidad: "°C", nota: `lote #${d.valor("tostado_lote")}` },
    { titulo: "Eficiencia de línea", valor: num(d.num("eficiencia_linea"), 1), unidad: "%", nota: "OEE del turno" },
    { titulo: "Tarimas listas", valor: num(d.num("tarimas_listas")), nota: `próximo envío ${d.valor("proximo_envio")}` },
  ],
  historial: ["empaque_bolsas_minuto", "enfriado_temperatura", "tostado_temperatura"],
  nombres: {
    tostado_temperatura: "Tostado · temperatura",
    enfriado_temperatura: "Enfriado · temperatura del grano",
    empaque_bolsas_minuto: "Empaque · bolsas por minuto",
    empaque_peso_medio: "Empaque · peso medio",
    recepcion_humedad: "Recepción · humedad",
    bolsas_empacadas: "Bolsas empacadas",
    cafe_tostado_hoy: "Café tostado hoy",
    paletizado_en_tarima: "Paletizado · bolsas en tarima",
    tostado_lote: "Tostado · lote",
  },
  Planta: ({ paradaDesde }) => (
    <>
      <Entorno />
      <Congela desde={paradaDesde("recepcion")}>
        <Recepcion />
        <Camion />
      </Congela>
      <Congela desde={paradaDesde("tostado")}>
        <Tostadora />
      </Congela>
      <Congela desde={paradaDesde("enfriado")}>
        <Enfriado />
      </Congela>
      <Congela desde={paradaDesde("empaque")}>
        <Empacadora />
      </Congela>
      <Congela desde={paradaDesde("empaque") ?? paradaDesde("paletizado")}>
        <LineaBolsas />
      </Congela>
    </>
  ),
};
