// Gimnasio: recepción y cobros, y las cuatro salas. Cifras de datos/planta.csv.
import { Bike, CalendarCheck, ConciergeBell, Dumbbell, Waves } from "lucide-react";
import { Congela } from "../../piezas/base";
import { Barras, Linea, Ranking } from "../../tablero/Grafica";
import { Dato, mono, num, Titulo } from "../../tablero/ui";
import type { Datos } from "../../tablero/datos";
import type { MundoTablero } from "../tipos";
import { Cardio, Clases, Entorno, Musculacion, Piscina, Recepcion, Socios } from "./piezas";

const Accion: React.FC<{ texto: string }> = ({ texto }) => (
  <p style={{ ...mono(12), lineHeight: 1.5, margin: "14px 0 0" }}>{texto}</p>
);

const ranking = (filas: ReturnType<Datos["filas"]>) => filas.map((f) => ({ nombre: f.nota, valor: Number(f.valor) || 0 }));

const fechaDia = (d: Datos, i: number) => {
  const f = new Date(`${d.valor("fecha_inicio")}T12:00:00`);
  f.setDate(f.getDate() + i);
  return `${f.getDate()}/${f.getMonth() + 1}`;
};

const veces = (v: number) => num(v);

export const gimnasio: MundoTablero = {
  titulo: "Gimnasio",
  acento: "socios, salas y cobros",
  encuadre: [0, 2, 0],
  escala: 0.7,
  arranque: 10,
  zonas: [
    {
      id: "recepcion",
      nombre: "Recepción",
      tecla: "1",
      icono: ConciergeBell,
      zona: { centro: [10.5, 1.5, 10.5], tam: [10.6, 3.4, 10.6] },
      ancla: [14, 1.8, 11],
      titular: (d) => `${num(d.num("recepcion_sin_cobrar_eur"))} € por cobrar`,
      Panel: ({ d }) => (
        <>
          <Dato etiqueta="Por cobrar" valor={`${num(d.num("recepcion_sin_cobrar_eur"), 2)} €`} />
          <Dato etiqueta="Pagos pendientes" valor={`${num(d.num("recepcion_pendientes"))} socios`} />
          <Dato etiqueta="Pagos devueltos" valor={`${num(d.num("recepcion_devueltos"))} socios`} />
          <Dato etiqueta="Sin venir 10 días o más" valor={`${num(d.num("recepcion_socios_sin_venir"))} socios`} />
          <Accion texto="Reintenta el cobro y llama; con más de 30 días, corta el acceso. Escribe a los socios con 10 días o más sin venir." />
          <Titulo texto="Socios por plan" />
          <Ranking filas={ranking(d.filas("recepcion_socios_plan"))} formato={veces} />
        </>
      ),
    },
    {
      id: "musculacion",
      nombre: "Musculación",
      tecla: "2",
      icono: Dumbbell,
      zona: { centro: [-10.5, 1.5, -10.5], tam: [10.6, 3.6, 10.6] },
      ancla: [-13, 2.9, -13],
      titular: (d) => `${num(d.num("musculacion_averias_7d"))} fallos en 7 días`,
      Panel: ({ d }) => (
        <>
          <Dato etiqueta="Incidencias, 30 días" valor={num(d.num("musculacion_averias_30d"))} />
          <Dato etiqueta="Incidencias, 7 días" valor={num(d.num("musculacion_averias_7d"))} />
          <Dato etiqueta="Máquinas afectadas" valor={num(d.num("musculacion_maquinas_afectadas"))} />
          <Dato etiqueta="A retirar (3 fallos en 30 días)" valor={num(d.num("musculacion_maquinas_retirar"))} />
          <Dato etiqueta="Visitas · minutos medios" valor={`${num(d.num("musculacion_visitas"))} · ${num(d.num("musculacion_minutos"))} min`} />
          <Accion texto="Con averías, avisa al técnico. Con 3 fallos en 30 días, retira la máquina." />
          <Titulo texto="Fallos por máquina (30 días)" />
          <Ranking filas={ranking(d.filas("musculacion_fallos_maquina"))} formato={veces} />
          <Titulo texto="Visitas por día" />
          <Linea valores={d.serie("musculacion_visitas_dia")} formato={veces} etiquetaX={(i) => fechaDia(d, i)} />
        </>
      ),
    },
    {
      id: "cardio",
      nombre: "Cardio",
      tecla: "3",
      icono: Bike,
      zona: { centro: [0, 1.2, 0], tam: [7.4, 2.8, 7.4] },
      ancla: [0, 1.9, -1.7],
      titular: (d) => `${num(d.num("cardio_averias_7d"))} fallos en 7 días`,
      Panel: ({ d }) => (
        <>
          <Dato etiqueta="Incidencias, 30 días" valor={num(d.num("cardio_averias_30d"))} />
          <Dato etiqueta="Incidencias, 7 días" valor={num(d.num("cardio_averias_7d"))} />
          <Dato etiqueta="Máquinas afectadas" valor={num(d.num("cardio_maquinas_afectadas"))} />
          <Dato etiqueta="A retirar (3 fallos en 30 días)" valor={num(d.num("cardio_maquinas_retirar"))} />
          <Dato etiqueta="Visitas · minutos medios" valor={`${num(d.num("cardio_visitas"))} · ${num(d.num("cardio_minutos"))} min`} />
          <Accion texto="Con averías, avisa al técnico. Con 3 fallos en 30 días, retira la máquina." />
          <Titulo texto="Fallos por máquina (30 días)" />
          <Ranking filas={ranking(d.filas("cardio_fallos_maquina"))} formato={veces} />
          <Titulo texto="Visitas por día" />
          <Linea valores={d.serie("cardio_visitas_dia")} formato={veces} etiquetaX={(i) => fechaDia(d, i)} />
        </>
      ),
    },
    {
      id: "clases",
      nombre: "Clases",
      tecla: "4",
      icono: CalendarCheck,
      zona: { centro: [-10.5, 1.5, 10.5], tam: [10.6, 3.4, 10.6] },
      ancla: [-14.2, 1.6, 10.5],
      titular: (d) => `${num(d.num("clases_visitas"))} asistencias`,
      Panel: ({ d }) => (
        <>
          <Dato etiqueta="Asistencias, 30 días" valor={num(d.num("clases_visitas"))} />
          <Dato etiqueta="Incidencias, 30 · 7 días" valor={`${num(d.num("clases_averias_30d"))} · ${num(d.num("clases_averias_7d"))}`} />
          <Dato etiqueta="Máquinas afectadas" valor={num(d.num("clases_maquinas_afectadas"))} />
          <Dato etiqueta="A retirar (3 fallos en 30 días)" valor={num(d.num("clases_maquinas_retirar"))} />
          <Dato etiqueta="Minutos medios" valor={`${num(d.num("clases_minutos"))} min`} />
          <Accion texto="Repite las clases con más asistencia. En hora punta, refuerza personal y abre más clases de 18:00 a 21:00." />
          <Titulo texto="Asistencias por clase" />
          <Ranking filas={ranking(d.filas("clases_asistencias"))} formato={veces} />
          <Titulo texto="Entradas al club por hora" />
          <Barras valores={d.serie("clases_entradas_hora")} formato={veces} etiquetaX={(i) => `${7 + i}h`} />
          <Titulo texto="Fallos por máquina (30 días)" />
          <Ranking filas={ranking(d.filas("clases_fallos_maquina"))} formato={veces} />
          <Titulo texto="Asistencias por día" />
          <Linea valores={d.serie("clases_visitas_dia")} formato={veces} etiquetaX={(i) => fechaDia(d, i)} />
        </>
      ),
    },
    {
      id: "piscina",
      nombre: "Piscina",
      tecla: "5",
      icono: Waves,
      zona: { centro: [10.5, 1.5, -10.5], tam: [10.6, 3.4, 10.6] },
      ancla: [11, 1, -11.5],
      titular: (d) => `${num(d.num("piscina_variacion_pct"), 1)} % visitas`,
      Panel: ({ d }) => (
        <>
          <Dato etiqueta="Visitas, última semana" valor={num(d.num("piscina_visitas_7d"))} />
          <Dato etiqueta="Visitas, semana anterior" valor={num(d.num("piscina_visitas_7d_previa"))} />
          <Dato etiqueta="Variación semanal" valor={`${num(d.num("piscina_variacion_pct"), 1)} %`} />
          <Dato etiqueta="Incidencias, 30 · 7 días" valor={`${num(d.num("piscina_averias_30d"))} · ${num(d.num("piscina_averias_7d"))}`} />
          <Dato etiqueta="Máquinas afectadas" valor={num(d.num("piscina_maquinas_afectadas"))} />
          <Dato etiqueta="Visitas · minutos medios" valor={`${num(d.num("piscina_visitas"))} · ${num(d.num("piscina_minutos"))} min`} />
          <Accion texto="Si bajan las visitas, ajusta horarios y climatización. Si sigue bajando, lanza una promoción." />
          <Titulo texto="Visitas por semana" />
          <Barras valores={d.serie("piscina_visitas_semana")} formato={veces} etiquetaX={(i) => (i === 3 ? "última" : `-${3 - i}`)} />
          <Titulo texto="Fallos por máquina (30 días)" />
          <Ranking filas={ranking(d.filas("piscina_fallos_maquina"))} formato={veces} />
          <Titulo texto="Visitas por día" />
          <Linea valores={d.serie("piscina_visitas_dia")} formato={veces} etiquetaX={(i) => fechaDia(d, i)} />
        </>
      ),
    },
  ],
  kpis: (d) => [
    { titulo: "Socios", valor: num(d.num("socios")), nota: "con alguna visita en 30 días" },
    { titulo: "Cobrado del mes", valor: num(d.num("cobrado_pct"), 1), unidad: "%", nota: `${num(d.num("cobrado_eur"), 2)} de ${num(d.num("cuotas_total_eur"), 2)} €` },
    { titulo: "Visitas al día", valor: num(d.num("visitas_dia"), 1), nota: `${num(d.num("hora_punta_pct"))} % de 18:00 a 21:00` },
    { titulo: "Incidencias", valor: num(d.num("incidencias_total")), nota: `${num(d.num("maquinas_afectadas"))} máquinas afectadas` },
    { titulo: "Sin venir", valor: num(d.num("recepcion_socios_sin_venir")), unidad: "socios", nota: "10 días o más" },
  ],
  historial: [],
  nombres: {
    recepcion_sin_cobrar_eur: "Recepción · por cobrar",
    recepcion_socios_sin_venir: "Recepción · sin venir",
    musculacion_averias_7d: "Musculación · averías 7 días",
    cardio_averias_7d: "Cardio · averías 7 días",
    clases_averias_7d: "Clases · averías 7 días",
    piscina_variacion_pct: "Piscina · variación semanal",
  },
  Planta: ({ paradaDesde }) => (
    <>
      <Entorno />
      <Socios paradaDesde={paradaDesde} />
      <Congela desde={paradaDesde("recepcion")}>
        <Recepcion />
      </Congela>
      <Congela desde={paradaDesde("musculacion")}>
        <Musculacion />
      </Congela>
      <Congela desde={paradaDesde("cardio")}>
        <Cardio />
      </Congela>
      <Congela desde={paradaDesde("clases")}>
        <Clases />
      </Congela>
      <Congela desde={paradaDesde("piscina")}>
        <Piscina />
      </Congela>
    </>
  ),
};
