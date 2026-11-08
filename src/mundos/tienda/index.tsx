// Tienda online de cerámica: mundo de prueba hecho siguiendo la skill tablero-3d.
import { PackageCheck, PackageOpen, Truck, Warehouse } from "lucide-react";
import { Congela } from "../../piezas/base";
import { Barras, Ranking } from "../../tablero/Grafica";
import { Dato, num, Titulo } from "../../tablero/ui";
import type { MundoTablero } from "../tipos";
import { Almacen, Devoluciones, Entorno, Preparacion, Reparto } from "./piezas";

export const tienda: MundoTablero = {
  titulo: "Cerámica",
  acento: "tienda online",
  encuadre: [-1, 1.2, -1.5],
  arranque: 10,
  zonas: [
    {
      id: "almacen",
      nombre: "Almacén",
      tecla: "1",
      icono: Warehouse,
      zona: { centro: [-8.6, 2, -8.4], tam: [8.6, 4.4, 8.8] },
      ancla: [-8.6, 4.2, -8.4],
      titular: (d) => `${num(d.num("almacen_agotados"))} agotados`,
      Panel: ({ d }) => (
        <>
          <Dato etiqueta="Productos agotados" valor={num(d.num("almacen_agotados"))} />
          <Titulo texto="Stock por producto" />
          <Ranking filas={d.filas("almacen_stock").map((f) => ({ nombre: f.nota, valor: Number(f.valor) || 0 }))} formato={(v) => num(v)} />
        </>
      ),
    },
    {
      id: "preparacion",
      nombre: "Preparación",
      tecla: "2",
      icono: PackageCheck,
      zona: { centro: [1.5, 1, -2], tam: [12, 2.4, 5] },
      ancla: [-1.2, 1.6, -2],
      titular: (d) => `${num(d.num("preparacion_en_cola"))} en cola`,
      Panel: ({ d }) => (
        <>
          <Dato etiqueta="Pedidos en cola" valor={num(d.num("preparacion_en_cola"))} />
          <Dato etiqueta="Minutos por pedido" valor={`${num(d.num("preparacion_minutos"))} min`} />
          <Titulo texto="Pedidos preparados por hora" />
          <Barras valores={d.serie("preparacion_por_hora")} formato={(v) => num(v)} etiquetaX={(i) => `${String(9 + i).padStart(2, "0")}:00`} />
        </>
      ),
    },
    {
      id: "reparto",
      nombre: "Reparto",
      tecla: "3",
      icono: Truck,
      zona: { centro: [9.6, 1.6, 2], tam: [5.4, 3.4, 12] },
      ancla: [9.6, 3.4, -2],
      titular: (d) => `${num(d.num("reparto_en_ruta"))} en ruta`,
      Panel: ({ d }) => (
        <>
          <Dato etiqueta="Pedidos en ruta" valor={num(d.num("reparto_en_ruta"))} />
          <Dato etiqueta="Llegarán tarde hoy" valor={num(d.num("reparto_tarde"))} />
          <Dato etiqueta="Próxima furgoneta" valor={d.valor("reparto_proxima_salida")} />
        </>
      ),
    },
    {
      id: "devoluciones",
      nombre: "Devoluciones",
      tecla: "4",
      icono: PackageOpen,
      zona: { centro: [-7, 1, 5], tam: [6.4, 2.4, 5] },
      ancla: [-7, 1.8, 6.4],
      titular: (d) => `${num(d.num("devoluciones_hoy"))} hoy`,
      Panel: ({ d }) => (
        <>
          <Dato etiqueta="Devoluciones hoy" valor={num(d.num("devoluciones_hoy"))} />
          <Dato etiqueta="Llegaron rotas" valor={num(d.num("devoluciones_rotos"))} />
          <Dato etiqueta="Devueltos (30 días)" valor={`${num(d.num("devoluciones_pct"), 1)} %`} />
        </>
      ),
    },
  ],
  kpis: (d) => [
    { titulo: "Pedidos hoy", valor: num(d.num("pedidos_hoy")), nota: `${num(d.num("preparacion_en_cola"))} en cola` },
    { titulo: "Entregas a tiempo", valor: num(d.num("entregas_a_tiempo"), 1), unidad: "%", nota: "últimos 7 días" },
    { titulo: "Ticket medio", valor: num(d.num("ticket_medio"), 1), unidad: "€", nota: "por pedido" },
    { titulo: "Devoluciones", valor: num(d.num("devoluciones_pct"), 1), unidad: "%", nota: "últimos 30 días" },
  ],
  historial: ["preparacion_en_cola"],
  nombres: {
    preparacion_en_cola: "Preparación · pedidos en cola",
    reparto_en_ruta: "Reparto · en ruta",
    almacen_agotados: "Almacén · agotados",
    almacen_stock: "Almacén · stock",
    pedidos_hoy: "Pedidos hoy",
  },
  Planta: ({ paradaDesde }) => (
    <>
      <Entorno />
      <Congela desde={paradaDesde("almacen")}>
        <Almacen />
      </Congela>
      <Congela desde={paradaDesde("preparacion")}>
        <Preparacion />
      </Congela>
      <Congela desde={paradaDesde("reparto")}>
        <Reparto />
      </Congela>
      <Congela desde={paradaDesde("devoluciones")}>
        <Devoluciones />
      </Congela>
    </>
  ),
};
