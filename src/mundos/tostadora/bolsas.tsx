import { Banda, Caja, Cil, Entra, Esfera, frac, limite, PAL, suave, useT, type V3 } from "../../piezas/base";
import { cuadratica, entradaSalida } from "../../piezas/curvas";
import { CICLO, PLANTA } from "./tiempos";

const X = 9;
const BANDA_Y = 1.1;
const PRIMERA_Z = -1.4;
const PASO_Z = 1.9;
const SLOTS = 5; // 0 llenado · 2 sellado · 3 etiqueta · 5 recogida
const MUEVE = 0.45; // parte del ciclo en que la banda avanza

const ALTO = 1.45;
const BASE: V3 = [6.6, 0.1, 9.3];
const PALE: V3 = [4, 0.34, 7.8];
const PINZA = 0.72;
const BRAZO = 2.45;

const avance = (t: number) => {
  const u = Math.max(0, (t - PLANTA.bolsas) / CICLO);
  const n = Math.floor(u);
  const f = frac(u);
  return { pos: n + suave(limite(f / MUEVE)), reposo: f > MUEVE ? (f - MUEVE) / (1 - MUEVE) : -1 };
};

/** Bolsa de café: `lleno` 0 = plana, 1 = llena; `etiqueta` aparece al pasar por el aplicador. */
const Bolsa: React.FC<{ p: V3; lleno?: number; etiqueta?: boolean; sellada?: boolean }> = ({ p, lleno = 1, etiqueta = true, sellada = true }) => {
  const f = 0.3 + lleno * 0.7;
  return (
    <group position={p}>
      <group scale={[f, 1, 0.82 + lleno * 0.18]}>
        <Caja s={[0.82, ALTO, 1.12]} p={[0, ALTO / 2, 0]} c={PAL.grafito} r={0.17} rug={0.42} />
      </group>
      <Caja s={[0.2, sellada ? 0.2 : 0.14, 1.14]} p={[0, ALTO + 0.05, 0]} c={sellada ? PAL.piedra : PAL.grafitoSuave} r={0.05} />
      {etiqueta && (
        <>
          <Caja s={[0.03, 0.78, 0.76]} p={[0.42, ALTO / 2, 0]} c={PAL.esmeralda} r={0.01} sombra={false} />
          <Esfera r={0.2} escala={[0.2, 1.3, 0.85]} p={[0.44, ALTO / 2 + 0.08, 0]} c={PAL.blanco} sombra={false} />
          <Caja s={[0.02, 0.05, 0.46]} p={[0.44, ALTO / 2 - 0.26, 0]} c={PAL.blanco} r={0.005} sombra={false} />
        </>
      )}
    </group>
  );
};

/** Brazo de dos eslabones resuelto con cinemática inversa: basta decir dónde va la pinza. */
const Brazo: React.FC<{ punta: V3; cierra: number }> = ({ punta, cierra }) => {
  const dx = punta[0] - BASE[0];
  const dz = punta[2] - BASE[2];
  const hombroY = 1.25;
  const dy = punta[1] + PINZA - BASE[1] - hombroY;
  const r = Math.hypot(dx, dz);
  const d = Math.min(Math.hypot(r, dy), BRAZO * 2 - 0.01);
  const phi = Math.atan2(dy, r);
  const alfa = Math.acos(d / (2 * BRAZO));
  const a1 = phi + alfa;
  const a2 = phi - alfa;
  return (
    <group position={BASE} rotation={[0, Math.atan2(-dz, dx), 0]}>
      <Cil r={0.72} r2={0.86} h={0.4} p={[0, 0.2, 0]} c={PAL.grafito} />
      <Cil r={0.46} h={0.85} p={[0, 0.8, 0]} c={PAL.blanco} />
      <group position={[0, hombroY, 0]} rotation={[0, 0, a1]}>
        <Cil r={0.32} h={0.62} rot={[Math.PI / 2, 0, 0]} c={PAL.esmeralda} />
        <Caja s={[BRAZO, 0.36, 0.36]} p={[BRAZO / 2, 0, 0]} c={PAL.blanco} r={0.14} />
        <group position={[BRAZO, 0, 0]} rotation={[0, 0, a2 - a1]}>
          <Cil r={0.26} h={0.52} rot={[Math.PI / 2, 0, 0]} c={PAL.esmeralda} />
          <Caja s={[BRAZO, 0.27, 0.27]} p={[BRAZO / 2, 0, 0]} c={PAL.blanco} r={0.11} />
          <group position={[BRAZO, 0, 0]} rotation={[0, 0, -a2]}>
            <Cil r={0.14} h={0.34} p={[0, -0.17, 0]} c={PAL.grafito} />
            <Caja s={[0.38, 0.12, 1.25]} p={[0, -0.38, 0]} c={PAL.grafito} r={0.04} />
            {[-1, 1].map((l) => (
              <Caja key={l} s={[0.3, 0.3, 0.07]} p={[0, -0.56, l * (0.62 - cierra * 0.04)]} c={PAL.piedra} r={0.03} />
            ))}
          </group>
        </group>
      </group>
    </group>
  );
};

const ranura = (k: number): V3 => {
  const capa = Math.floor(k / 6);
  const i = k % 6;
  return [PALE[0] + (i % 3 - 1) * 0.98, PALE[1] + capa * (ALTO + 0.28), PALE[2] + (i < 3 ? -0.62 : 0.62)];
};

/** Empaque: bolsas que avanzan por estaciones, prensa, etiquetadora y brazo que paletiza. */
export const LineaBolsas: React.FC = () => {
  const t = useT();
  const { pos, reposo } = avance(t);
  const golpe = reposo < 0 ? 0 : Math.sin(reposo * Math.PI);
  const primera = Math.floor(pos) - SLOTS - 1;

  const bolsas = [];
  for (let k = Math.max(0, primera); k <= Math.floor(pos); k++) {
    const sl = pos - k - 1; // -1 entra plana, 5 la recoge el brazo
    if (sl >= SLOTS) continue;
    const z = PRIMERA_Z + sl * PASO_Z;
    const enLlenado = sl <= 0 ? limite(sl + 1) : 1;
    bolsas.push(<Bolsa key={k} p={[X, BANDA_Y + 0.1, z]} lleno={sl < 0 ? enLlenado * 0.3 : limite(0.3 + sl * 2)} sellada={sl >= 2} etiqueta={sl >= 3 && (sl > 3 || reposo > 0.4)} />);
  }

  // Ciclo del brazo: `c` 0 agarra en la banda, 1 ha vuelto a por la siguiente.
  const u = (t - PLANTA.bolsas) / CICLO - SLOTS - 1 - MUEVE;
  const hecha = Math.floor(u);
  const c = frac(u);
  const activa = u >= 0;
  const destino = ranura(Math.max(0, hecha));
  const recoge: V3 = [X, BANDA_Y + 0.1 + ALTO, PRIMERA_Z + SLOTS * PASO_Z];
  const suelta: V3 = [destino[0], destino[1] + ALTO, destino[2]];
  const altura = Math.max(recoge[1], suelta[1]) + 1.15;
  const espera: V3 = [recoge[0], recoge[1] + 0.9, recoge[2]];
  const ease = entradaSalida(cuadratica);
  let punta: V3;
  const mezcla = (a: V3, b: V3, k: number): V3 => {
    const e = ease(limite(k));
    return [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e];
  };
  const alto1: V3 = [recoge[0], altura, recoge[2]];
  const alto2: V3 = [suelta[0], altura, suelta[2]];
  if (!activa) punta = espera;
  else if (c < 0.06) punta = recoge;
  else if (c < 0.2) punta = mezcla(recoge, alto1, (c - 0.06) / 0.14);
  else if (c < 0.5) punta = mezcla(alto1, alto2, (c - 0.2) / 0.3);
  else if (c < 0.63) punta = mezcla(alto2, suelta, (c - 0.5) / 0.13);
  else if (c < 0.68) punta = suelta;
  else if (c < 0.8) punta = mezcla(suelta, alto2, (c - 0.68) / 0.12);
  else punta = mezcla(alto2, recoge, (c - 0.8) / 0.2);
  const lleva = activa && c < 0.66;

  const colocadas = Math.max(0, hecha + (activa && c >= 0.66 ? 1 : 0));
  const zPrensa = PRIMERA_Z + 2 * PASO_Z;
  const zEtiq = PRIMERA_Z + 3 * PASO_Z;

  return (
    <>
      <Entra en={1.6}>
        <Banda a={[X, BANDA_Y, -3.2]} b={[X, BANDA_Y, 8.9]} desde={PLANTA.bolsas} vel={0} ancho={1.5} />
        {bolsas}
        {/* prensa de sellado */}
        {[-1.15, 1.15].map((dx) => (
          <Caja key={dx} s={[0.22, 4.4, 0.34]} p={[X + dx, 2.2, zPrensa]} c={PAL.blanco} r={0.06} />
        ))}
        <Caja s={[2.7, 0.4, 0.7]} p={[X, 4.45, zPrensa]} c={PAL.grafito} r={0.1} />
        <Cil r={0.1} h={1.1} p={[X, 3.95 - golpe * 0.38, zPrensa]} c={PAL.acero} />
        <Caja s={[1, 0.3, 1.34]} p={[X, 3.36 - golpe * 0.38, zPrensa]} c={PAL.esmeralda} r={0.07} />
        {/* etiquetadora */}
        <Caja s={[0.26, 2.5, 0.5]} p={[X + 1.2, 1.25, zEtiq]} c={PAL.blanco} r={0.08} />
        <Caja s={[0.5 + golpe * 0.34, 0.16, 0.16]} p={[X + 0.95 - golpe * 0.17, 1.95, zEtiq]} c={PAL.acero} r={0.05} />
        <Caja s={[0.08, 0.84, 0.84]} p={[X + 0.5 + (1 - golpe) * 0.2, 1.95, zEtiq]} c={PAL.esmeralda} r={0.03} />
      </Entra>
      <Entra en={1.85}>
        <Caja s={[3.4, 0.3, 2.9]} p={[PALE[0], 0.15, PALE[2]]} c={PAL.acero} r={0.05} />
        {Array.from({ length: Math.min(18, colocadas) }, (_, k) => (
          <Bolsa key={k} p={ranura(k)} />
        ))}
        {lleva && <Bolsa p={[punta[0], punta[1] - ALTO, punta[2]]} />}
        <Brazo punta={punta} cierra={lleva ? 1 : 0} />
      </Entra>
      <Entra en={2.05}>
        {/* tarima terminada, envuelta y lista para salir */}
        <Caja s={[3.4, 0.3, 2.9]} p={[0.2, 0.15, 8.6]} c={PAL.acero} r={0.05} />
        {Array.from({ length: 12 }, (_, k) => {
          const r = ranura(k);
          return <Bolsa key={k} p={[r[0] - 3.8, r[1], r[2] + 0.8]} />;
        })}
      </Entra>
    </>
  );
};
