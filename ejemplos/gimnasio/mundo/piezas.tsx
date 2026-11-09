// Piezas del gimnasio. Todo se mueve con useT().
import { Caja, Cil, Esfera, frac, hash, PAL, useT } from "../../piezas/base";
import type { V3 } from "../../piezas/base";
import { Arbol, Furgoneta, Persona } from "../../piezas/comunes";

const MADERA = "#C9A27A";
const AGUA = "#6FC3D6";
const AGUA_CLARA = "#A9E0EA";

/** Suelo de una sala con sus dos muros del fondo; el de -z deja un hueco de puerta. */
const Sala: React.FC<{ x: number; z: number; suelo: string; muro?: string }> = ({ x, z, suelo, muro = PAL.blanco }) => (
  <group>
    <Caja s={[10, 0.1, 10]} p={[x, 0.05, z]} c={suelo} r={0.03} />
    <Caja s={[0.3, 1.5, 10]} p={[x - 5, 0.75, z]} c={muro} r={0.05} />
    <Caja s={[3.8, 1.5, 0.3]} p={[x - 3.1, 0.75, z - 5]} c={muro} r={0.05} />
    <Caja s={[3.8, 1.5, 0.3]} p={[x + 3.1, 0.75, z - 5]} c={muro} r={0.05} />
  </group>
);

/** Barra con discos en los extremos, orientada en x. */
const Barra: React.FC<{ p: V3; largo?: number }> = ({ p, largo = 2.2 }) => (
  <group position={p}>
    <Cil r={0.035} h={largo} lados={10} rot={[0, 0, Math.PI / 2]} c={PAL.acero} />
    {[-1, 1].map((l) => (
      <Cil key={l} r={0.32} h={0.14} lados={18} p={[(l * largo) / 2.4, 0, 0]} rot={[0, 0, Math.PI / 2]} c={PAL.acento} />
    ))}
  </group>
);

/** Musculación: jaula de sentadillas, bancos, polea y prensa en plena serie. */
export const Musculacion: React.FC = () => {
  const t = useT();
  const onda = (v: number, f = 0) => (Math.sin(t * v + f) + 1) / 2;
  const sent = onda(2.2);
  return (
    <group>
      <Sala x={-10.5} z={-10.5} suelo={PAL.grafitoSuave} />
      {/* Jaula de sentadillas */}
      <group position={[-13, 0.1, -13]}>
        {[-1, 1].flatMap((a) => [-1, 1].map((b) => <Caja key={`${a}${b}`} s={[0.12, 2.6, 0.12]} p={[a * 1.1, 1.3, b * 0.8]} c={PAL.grafito} r={0.02} />))}
        <Caja s={[2.32, 0.12, 0.12]} p={[0, 2.6, -0.8]} c={PAL.grafito} r={0.02} />
        <Caja s={[2.32, 0.12, 0.12]} p={[0, 2.6, 0.8]} c={PAL.grafito} r={0.02} />
        <group scale={[1, 1 - sent * 0.28, 1]}>
          <Persona p={[0, 0, 0]} c={PAL.claro} />
        </group>
        <Barra p={[0, 1.2 - sent * 0.33, 0]} />
      </group>
      {/* Bancos con barra */}
      {[-9.6, -7].map((x, i) => {
        const k = onda(2.6, i * 1.7);
        return (
          <group key={x} position={[x, 0.1, -13]}>
            <Caja s={[0.6, 0.4, 1.9]} p={[0, 0.2, 0]} c={PAL.grafito} r={0.06} />
            <group position={[0, 0.5, 0.62]} rotation={[-Math.PI / 2, 0, 0]}>
              <Persona p={[0, 0, 0]} c={i ? PAL.menta : PAL.blanco} />
            </group>
            {[-1, 1].map((l) => (
              <Caja key={l} s={[0.1, 1.3, 0.1]} p={[l * 0.85, 0.65, -0.4]} c={PAL.acero} r={0.02} />
            ))}
            <Barra p={[0, 1 + k * 0.42, 0]} largo={2} />
          </group>
        );
      })}
      {/* Polea con pila de pesas */}
      <group position={[-13.4, 0.1, -7.6]}>
        <Caja s={[1.1, 2.9, 0.16]} p={[0, 1.45, -0.5]} c={PAL.grafito} r={0.03} />
        <Caja s={[0.7, 0.9, 0.3]} p={[0, 0.55 + onda(2, 1) * 0.8, -0.3]} c={PAL.acento} r={0.04} />
        <Persona p={[0, 0, 0.75]} c={PAL.piedra} giro={Math.PI} />
      </group>
      {/* Prensa */}
      <group position={[-8.6, 0.1, -8]}>
        <Caja s={[1.2, 0.3, 2.8]} p={[0, 0.15, 0]} c={PAL.grafito} r={0.05} />
        <Caja s={[0.8, 0.5, 0.9]} p={[0, 0.55, 0.8]} c={PAL.acero} r={0.08} />
        <Persona p={[0, 0.3, 0.75]} c={PAL.claro} />
        <group position={[0, 0.5 + onda(1.8, 2) * 0.5, -0.5 - onda(1.8, 2) * 0.5]}>
          <Caja s={[1, 0.8, 0.14]} c={PAL.acento} r={0.04} />
        </group>
      </group>
      {/* Mancuernero junto al muro */}
      <group position={[-13.7, 0.1, -10.4]}>
        <Caja s={[0.8, 0.9, 2.4]} p={[0, 0.45, 0]} c={PAL.acero} r={0.05} />
        {[-0.8, -0.27, 0.27, 0.8].map((z) => (
          <Cil key={z} r={0.14} h={0.56} lados={12} p={[0, 1.02, z]} rot={[0, 0, Math.PI / 2]} c={PAL.grafito} />
        ))}
      </group>
    </group>
  );
};

const Cinta: React.FC<{ p: V3; i: number }> = ({ p, i }) => {
  const t = useT();
  return (
    <group position={p}>
      <Caja s={[0.95, 0.2, 2]} p={[0, 0.1, 0]} c={PAL.grafito} r={0.05} />
      {[0, 1, 2, 3].map((n) => (
        <Caja key={n} s={[0.72, 0.012, 0.08]} p={[0, 0.21, 0.9 - 1.8 * frac(t * 0.9 + n / 4)]} c={PAL.acero} r={0.002} sombra={false} />
      ))}
      <Caja s={[0.08, 1.2, 0.08]} p={[-0.42, 0.75, -0.85]} c={PAL.acero} r={0.02} />
      <Caja s={[0.08, 1.2, 0.08]} p={[0.42, 0.75, -0.85]} c={PAL.acero} r={0.02} />
      <Caja s={[0.95, 0.34, 0.14]} p={[0, 1.42, -0.85]} c={PAL.acento} r={0.04} />
      <Persona p={[0, 0.2 + Math.abs(Math.sin(t * 5 + i)) * 0.14, 0]} c={[PAL.claro, PAL.piedra, PAL.menta][i % 3]} />
    </group>
  );
};

const Bici: React.FC<{ p: V3; i: number; c?: string }> = ({ p, i, c = PAL.blanco }) => {
  const t = useT();
  return (
    <group position={p}>
      <Caja s={[0.6, 0.08, 1.5]} p={[0, 0.04, 0]} c={PAL.grafito} r={0.02} />
      <group position={[0, 0.48, -0.5]} rotation={[t * 5 + i, 0, 0]}>
        <Cil r={0.38} h={0.09} lados={20} rot={[0, 0, Math.PI / 2]} c={PAL.acento} />
        <Caja s={[0.11, 0.7, 0.05]} c={PAL.blanco} r={0.01} sombra={false} />
      </group>
      <Caja s={[0.08, 0.72, 0.08]} p={[0, 0.4, 0.3]} c={PAL.acero} r={0.02} />
      <Caja s={[0.38, 0.1, 0.42]} p={[0, 0.78, 0.3]} c={PAL.grafito} r={0.04} />
      <Persona p={[0, 0.72 + Math.sin(t * 5 + i) * 0.03, 0.3]} c={c} />
    </group>
  );
};

/** Cardio: cintas con la banda en marcha, bicis y elípticas. */
export const Cardio: React.FC = () => {
  const t = useT();
  return (
    <group>
      <Caja s={[7, 0.1, 7]} p={[0, 0.05, 0]} c={PAL.hueso} r={0.03} />
      {[-2.2, 0, 2.2].map((x, i) => (
        <Cinta key={x} p={[x, 0.1, -1.7]} i={i} />
      ))}
      <Bici p={[-2.2, 0.1, 1.7]} i={0} c={PAL.claro} />
      <Bici p={[0, 0.1, 1.7]} i={1} c={PAL.menta} />
      {/* Elíptica */}
      <group position={[2.2, 0.1, 1.7]}>
        <Caja s={[0.65, 0.14, 1.9]} p={[0, 0.07, 0]} c={PAL.grafito} r={0.03} />
        <Cil r={0.36} h={0.2} lados={20} p={[0, 0.5, -0.65]} rot={[0, 0, Math.PI / 2]} c={PAL.acento} />
        {[-1, 1].map((l) => (
          <group key={l} position={[l * 0.26, 0.6, -0.5]} rotation={[Math.sin(t * 3.4 + (l * Math.PI) / 2) * 0.42, 0, 0]}>
            <Caja s={[0.06, 1.3, 0.06]} p={[0, 0.5, 0]} c={PAL.acero} r={0.02} />
          </group>
        ))}
        <Persona p={[0, 0.2 + Math.sin(t * 3.4) * 0.06, 0.25]} c={PAL.blanco} />
      </group>
    </group>
  );
};

/** Clases: suelo de madera, espejo, monitor delante y alumnos a su ritmo. */
export const Clases: React.FC = () => {
  const t = useT();
  const pulso = 1 + Math.max(0, Math.sin(t * 7)) * 0.08;
  return (
    <group>
      <Sala x={-10.5} z={10.5} suelo={MADERA} />
      <Caja s={[0.06, 1.25, 8.6]} p={[-15.3, 0.85, 10.5]} c={PAL.acero} r={0.02} />
      <Caja s={[1.5, 0.22, 3]} p={[-14.2, 0.2, 10.5]} c={PAL.grafito} r={0.05} />
      <Persona p={[-14.2, 0.3 + Math.abs(Math.sin(t * 3)) * 0.34, 10.5]} c={PAL.acento} giro={Math.PI / 2} />
      {[6.9, 14.1].map((z) => (
        <group key={z} position={[-14.9, 0.1, z]} scale={[pulso, pulso, pulso]}>
          <Caja s={[0.65, 1.2, 0.65]} p={[0, 0.6, 0]} c={PAL.grafito} r={0.06} />
          <Cil r={0.2} h={0.05} lados={18} p={[0.34, 0.75, 0]} rot={[0, 0, Math.PI / 2]} c={PAL.acero} />
        </group>
      ))}
      {[-11.8, -9.2, -6.8].flatMap((x, a) =>
        [8.5, 11, 13.5].map((z, b) => {
          const f = hash(a * 3 + b, 8) * 0.5;
          return (
            <group key={`${a}${b}`}>
              <Caja s={[1.8, 0.03, 1]} p={[x, 0.12, z]} c={[PAL.acento, PAL.menta, PAL.claro][(a + b) % 3]} r={0.01} sombra={false} />
              <Persona p={[x, 0.13 + Math.abs(Math.sin(t * 3 + f)) * 0.3, z]} c={[PAL.blanco, PAL.piedra, PAL.grafitoSuave][(a + 2 * b) % 3]} giro={-Math.PI / 2} />
            </group>
          );
        }),
      )}
    </group>
  );
};

/** Piscina: calles con nadadores, ondas y la sala técnica con su bomba y clorador. */
export const Piscina: React.FC = () => {
  const t = useT();
  const carriles = [8.3, 9.8, 11.3, 12.8];
  return (
    <group>
      <Sala x={10.5} z={-10.5} suelo={PAL.hueso} />
      <Caja s={[7.4, 0.5, 6.8]} p={[11, 0.25, -11.5]} c={PAL.blanco} r={0.1} />
      <Caja s={[6.7, 0.04, 6.1]} p={[11, 0.51, -11.5]} c={AGUA} r={0.01} sombra={false} />
      {[0, 1, 2, 3, 4, 5].map((n) => (
          <Caja key={n} s={[6.4, 0.008, 0.07]} p={[11, 0.535, -14.4 + 5.8 * frac(t * 0.1 + n / 6)]} c={AGUA_CLARA} r={0.002} sombra={false} />
      ))}
      {[9.05, 10.55, 12.05].map((x) => (
        <Caja key={x} s={[0.05, 0.05, 6]} p={[x, 0.56, -11.5]} c={PAL.acento} r={0.015} sombra={false} />
      ))}
      {carriles.map((x, i) => {
        const k = frac(t / (9 + i * 1.4) + i * 0.27);
        const ida = k < 0.5;
        const z = -14 + 5 * (ida ? k * 2 : 2 - k * 2);
        const braza = Math.sin(t * 6 + i) * 0.06;
        return (
          <group key={x} position={[x, 0.58 + braza * 0.3, z]}>
            <Esfera r={0.2} p={[0, 0.05, ida ? 0.48 : -0.48]} c={[PAL.acento, PAL.grafito, PAL.blanco, PAL.menta][i]} />
            <Esfera r={0.26} p={[0, 0, 0]} escala={[0.9, 0.45, 2]} c={PAL.claro} />
          </group>
        );
      })}
      {/* Sala técnica: bomba de calor y clorador */}
      <group position={[6.7, 0.1, -13.7]}>
        <Caja s={[1.4, 1.4, 1.4]} p={[0, 0.7, 0]} c={PAL.acero} r={0.08} />
        <group position={[0, 1.42, 0]} rotation={[0, t * 9, 0]}>
          <Caja s={[1.05, 0.04, 0.16]} c={PAL.grafito} r={0.01} />
          <Caja s={[0.16, 0.04, 1.05]} c={PAL.grafito} r={0.01} />
        </group>
      </group>
      <group position={[6.7, 0.1, -10.6]}>
        <Cil r={0.48} h={1.5} lados={20} p={[0, 0.75, 0]} c={PAL.menta} />
        <Esfera r={0.48} p={[0, 1.5, 0]} escala={[1, 0.5, 1]} c={PAL.menta} />
        <Esfera r={0.1} p={[0.5, 0.9 + Math.sin(t * 2) * 0.03, 0]} c={PAL.acento} />
      </group>
      {[12.2, 14].map((x) => (
        <group key={x} position={[x, 0.1, -7]}>
          <Caja s={[0.9, 0.2, 1.9]} p={[0, 0.2, 0]} c={PAL.blanco} r={0.06} />
        </group>
      ))}
    </group>
  );
};

/** Recepción: entrada de socios con tornos, mostrador y datáfono. */
export const Recepcion: React.FC = () => {
  const t = useT();
  return (
    <group>
      <Sala x={10.5} z={10.5} suelo={PAL.blanco} muro={PAL.hueso} />
      {/* Tornos */}
      {[9.1, 11.9].map((x, i) => (
        <group key={x} position={[x, 0.1, 8.6]}>
          <Caja s={[0.34, 1.05, 1.3]} p={[0, 0.52, 0]} c={PAL.grafito} r={0.06} />
          <group position={[i ? -0.26 : 0.26, 0.85, 0]} rotation={[0, t * 1.4 + i, 0]}>
            <Caja s={[0.85, 0.05, 0.05]} p={[0, 0, 0]} c={PAL.acento} r={0.01} />
          </group>
        </group>
      ))}
      {/* Mostrador con datáfono cuya pantalla pasa de tono */}
      <Caja s={[1.1, 1.05, 4.6]} p={[14, 0.62, 11]} c={PAL.acento} r={0.1} />
      <Caja s={[1.3, 0.09, 4.8]} p={[14, 1.2, 11]} c={PAL.blanco} r={0.04} />
      <Persona p={[15, 0.1, 10.4]} c={PAL.grafitoSuave} giro={-Math.PI / 2} />
      <Caja s={[0.1, 0.5, 0.75]} p={[13.7, 1.52, 10.2]} rot={[0, 0, 0.18]} c={frac(t / 3) < 0.5 ? PAL.menta : PAL.claro} r={0.02} />
      <Caja s={[0.38, 0.16, 0.26]} p={[13.7, 1.33, 12.2]} c={PAL.grafito} r={0.03} />
      {/* Sala de espera */}
      <Caja s={[0.85, 0.45, 2.8]} p={[6.6, 0.32, 11.2]} c={PAL.claro} r={0.14} />
      <Caja s={[1.3, 0.34, 0.8]} p={[8.4, 0.27, 13.7]} c={PAL.acero} r={0.08} />
      <Persona p={[6.8, 0.25, 12]} c={PAL.piedra} giro={Math.PI / 2} />
    </group>
  );
};

type Punto = [number, number];

/** Punto de una ruta en la fracción k (0–1), con el giro hacia donde camina. */
const enRuta = (ruta: Punto[], k: number) => {
  const tramos = ruta.slice(1).map((b, i) => Math.hypot(b[0] - ruta[i][0], b[1] - ruta[i][1]));
  let d = k * tramos.reduce((a, b) => a + b, 0);
  for (let i = 0; i < tramos.length; i++) {
    if (d <= tramos[i] || i === tramos.length - 1) {
      const u = tramos[i] ? d / tramos[i] : 0;
      const [a, b] = [ruta[i], ruta[i + 1]];
      return { x: a[0] + (b[0] - a[0]) * u, z: a[1] + (b[1] - a[1]) * u, giro: Math.atan2(b[0] - a[0], b[1] - a[1]) };
    }
    d -= tramos[i];
  }
  return { x: ruta[0][0], z: ruta[0][1], giro: 0 };
};

const ENTRADA: Punto[] = [
  [10.5, 13.8],
  [10.5, 4.5],
];
const RUTAS: { sala: string; ruta: Punto[]; T: number; f: number; c: string }[] = [
  { sala: "clases", ruta: [...ENTRADA, [-10.5, 4.5], [-10.5, 7.2]], T: 26, f: 0, c: PAL.claro },
  { sala: "clases", ruta: [...ENTRADA, [-10.5, 4.5], [-10.5, 7.2]], T: 26, f: 0.55, c: PAL.menta },
  { sala: "musculacion", ruta: [...ENTRADA, [4.5, 4.5], [4.5, -4.5], [-10.5, -4.5], [-10.5, -6.6]], T: 34, f: 0.2, c: PAL.piedra },
  { sala: "musculacion", ruta: [...ENTRADA, [4.5, 4.5], [4.5, -4.5], [-10.5, -4.5], [-10.5, -6.6]], T: 34, f: 0.7, c: PAL.acento },
  { sala: "piscina", ruta: [...ENTRADA, [10.5, -6.7]], T: 18, f: 0.35, c: PAL.claro },
  { sala: "piscina", ruta: [...ENTRADA, [10.5, -6.7]], T: 18, f: 0.85, c: PAL.grafitoSuave },
  { sala: "cardio", ruta: [...ENTRADA, [0, 4.5], [0, 3.2]], T: 15, f: 0.1, c: PAL.menta },
  { sala: "cardio", ruta: [...ENTRADA, [0, 4.5], [0, 3.2]], T: 15, f: 0.6, c: PAL.piedra },
];

/** Socios que entran por recepción y van a cada sala; una sala parada no recibe a nadie. */
export const Socios: React.FC<{ paradaDesde: (id: string) => number | undefined }> = ({ paradaDesde }) => {
  const t = useT();
  return (
    <group>
      {RUTAS.map((r, i) => {
        if (paradaDesde(r.sala) !== undefined) return null;
        const c = frac(t / r.T + r.f);
        const vuelta = c >= 0.5;
        const { x, z, giro } = enRuta(r.ruta, vuelta ? 2 - c * 2 : c * 2);
        return <Persona key={i} p={[x, Math.abs(Math.sin(t * 7 + i)) * 0.05, z]} c={r.c} giro={vuelta ? giro + Math.PI : giro} />;
      })}
    </group>
  );
};

/** Losa, pasillos, jardines y la furgoneta del técnico. */
export const Entorno: React.FC = () => {
  const t = useT();
  const k = frac(t / 22);
  const z = k < 0.3 ? 17 - (k / 0.3) * 7 : k < 0.65 ? 10 : 10 + ((k - 0.65) / 0.35) * 7;
  return (
    <group>
      <Caja s={[34, 0.24, 34]} p={[0, -0.12, 0]} c={PAL.blanco} r={0.1} />
      {[-4.5, 4.5].map((v) => (
        <group key={v}>
          <Caja s={[34, 0.03, 2]} p={[0, 0.015, v]} c={PAL.hueso} r={0.01} sombra={false} />
          <Caja s={[2, 0.03, 34]} p={[v, 0.015, 0]} c={PAL.hueso} r={0.01} sombra={false} />
        </group>
      ))}
      {(
        [
          [-1.8, -8],
          [1.7, -11],
          [-1.3, -14],
          [-8, -1.5],
          [-11, 1.7],
          [-14, -1.1],
          [8, 1.6],
          [11, -1.6],
          [14.4, 1.2],
          [-2.4, 13],
          [-1.7, 8.4],
        ] as [number, number][]
      ).map((p, i) => (
        <Arbol key={i} p={p} tono={i % 3 === 1 ? PAL.menta : PAL.claro} />
      ))}
      <group visible={z < 16}>
        <Furgoneta p={[1.4, 0, z]} giro={Math.PI} />
      </group>
    </group>
  );
};
