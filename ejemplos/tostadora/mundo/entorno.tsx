import { useContext, useLayoutEffect, useRef } from "react";
import { InstancedMesh, Object3D } from "three";
import { Caja, Cil, Entra, Esfera, frac, limite, PAL, SinPinesCtx, useT, type V3 } from "../../piezas/base";
import { atras, salida } from "../../piezas/curvas";
import { ACTO } from "./tiempos";

const ARBOLES: [number, number, number][] = [
  [-13.6, -6.2, 0.9], [-15, -3.6, 0.8], [-12.2, -3.4, 0.7], [-15.2, 7.4, 0.9], [-12.4, 8.6, 1], [-14.8, 10, 0.75],
  [0.6, 0.6, 1], [2.6, 1.7, 0.8], [4.4, 0.4, 0.9], [1.8, 3.6, 0.72],
  [-5, 7.6, 0.85], [-3.2, 9.8, 1], [-7, 10.2, 0.8],
  [4, -11.5, 1], [6.5, -12.2, 0.8], [8.8, -10.4, 0.9], [2.2, -9, 0.75], [11.5, -8.6, 0.85],
];

export const Arbol: React.FC<{ p: [number, number]; e: number; i: number }> = ({ p, e, i }) => (
  <group position={[p[0], 0, p[1]]} scale={e}>
    <Cil r={0.1} r2={0.15} h={1} lados={10} p={[0, 0.5, 0]} c={PAL.piedra} />
    <Esfera r={0.72} p={[0, 1.5, 0]} escala={[1, 1.15, 1]} c={i % 3 === 1 ? PAL.menta : PAL.claro} rug={0.8} />
  </group>
);

export const Coche: React.FC<{ p: V3; c: string; giro?: number }> = ({ p, c, giro = 0 }) => (
  <group position={p} rotation={[0, giro, 0]}>
    <Caja s={[2.1, 0.5, 1.05]} p={[0, 0.48, 0]} c={c} r={0.2} />
    <Caja s={[1.1, 0.42, 0.92]} p={[-0.1, 0.86, 0]} c={PAL.grafitoSuave} r={0.16} />
    {[-0.66, 0.66].map((x) => [-0.5, 0.5].map((z) => <Cil key={`${x}${z}`} r={0.2} h={0.16} lados={16} p={[x, 0.2, z]} rot={[Math.PI / 2, 0, 0]} c={PAL.grafito} />))}
  </group>
);

/** Furgón de reparto: pasa por la vía de abajo con la mercancía ya cargada. */
const Reparto: React.FC = () => {
  const t = useT();
  const k = limite((t - ACTO.sale) / (ACTO.fin - ACTO.sale));
  const x = -34 + k * 72;
  return (
    <group position={[x, 0, 13.6]} visible={k > 0}>
      <Caja s={[3.6, 2, 1.8]} p={[-0.7, 1.3, 0]} c={PAL.blanco} r={0.16} />
      <Caja s={[3.62, 0.5, 1.82]} p={[-0.7, 0.95, 0]} c={PAL.acento} r={0.04} />
      <Caja s={[1.4, 1.4, 1.74]} p={[1.6, 1.02, 0]} c={PAL.blanco} r={0.26} />
      <Caja s={[0.5, 0.6, 1.76]} p={[2.1, 1.4, 0]} c={PAL.grafito} r={0.1} />
      {[-1.6, 1.5].map((rx) => [-0.85, 0.85].map((rz) => <Cil key={`${rx}${rz}`} r={0.36} h={0.24} lados={18} p={[rx, 0.36, rz]} rot={[Math.PI / 2, 0, 0]} c={PAL.grafito} />))}
    </group>
  );
};

const aux = new Object3D();
const Paneles: React.FC<{ origen: V3 }> = ({ origen }) => {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    for (let i = 0; i < 12; i++) {
      aux.position.set(origen[0] + (i % 4) * 1.3, origen[1], origen[2] + Math.floor(i / 4) * 1.2);
      aux.rotation.set(0, 0, 0.2);
      aux.updateMatrix();
      m.setMatrixAt(i, aux.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [origen]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, 12]} castShadow>
      <boxGeometry args={[1.14, 0.06, 1]} />
      <meshStandardMaterial color={PAL.grafitoSuave} roughness={0.32} />
    </instancedMesh>
  );
};

const Almacen: React.FC = () => (
  <group>
    <Caja s={[8.6, 3.2, 5.6]} p={[-9.3, 1.6, 1.8]} c={PAL.blanco} r={0.18} />
    <Caja s={[8.7, 0.3, 5.7]} p={[-9.3, 3.15, 1.8]} c={PAL.acento} r={0.06} />
    <Paneles origen={[-11.3, 3.5, 0.6]} />
    {[-11.5, -9.3, -7.1].map((x) => (
      <Caja key={x} s={[1.5, 2, 0.08]} p={[x, 1, 4.62]} c={PAL.hueso} r={0.03} />
    ))}
    <Caja s={[0.08, 1.2, 2]} p={[-4.98, 0.95, 1.8]} c={PAL.grafito} r={0.03} />
  </group>
);

const Silo: React.FC<{ x: number; z: number; acento?: boolean }> = ({ x, z, acento }) => (
  <group position={[x, 0, z]}>
    <Cil r={1.05} h={4.4} p={[0, 2.8, 0]} c={PAL.blanco} />
    <Cil r={0.02} r2={1.05} h={0.8} p={[0, 5.4, 0]} c={acento ? PAL.acento : PAL.hueso} />
    <Cil r={1.05} r2={0.2} h={0.8} p={[0, 0.4, 0]} c={PAL.acero} />
  </group>
);

/** Pin flotante que marca la estación activa, como en un mapa. */
export const Pin: React.FC<{ p: V3; en: number; sale: number }> = ({ p, en, sale }) => {
  const t = useT();
  const oculto = useContext(SinPinesCtx);
  const entra = salida(atras(2))(limite((t - en) / 0.35));
  const fuera = limite((t - sale) / 0.25);
  const e = Math.max(0.0001, entra * (1 - fuera));
  if (oculto) return null;
  return (
    <group position={[p[0], p[1] + Math.sin(frac(t / 1.2) * 6.283) * 0.14, p[2]]} scale={e} visible={t > en && t < sale + 0.3}>
      <Esfera r={0.42} p={[0, 0.72, 0]} c={PAL.acento} rug={0.3} sombra={false} />
      <Cil r={0.3} r2={0.02} h={0.62} lados={20} p={[0, 0.24, 0]} c={PAL.acento} sombra={false} />
      <Esfera r={0.13} p={[0.26, 0.78, 0.26]} c={PAL.blanco} sombra={false} />
    </group>
  );
};

export const Entorno: React.FC = () => (
  <>
    <Entra en={-1}>
      {/* la losa: tapa el suelo infinito y da borde al mundo */}
      <Caja s={[32, 0.24, 28]} p={[-2, -0.12, -1]} c={PAL.blanco} r={0.1} />
      {/* vía de entrada y pasillos */}
      <Caja s={[34, 0.03, 3.4]} p={[-31, 0.0, -10]} c={PAL.hueso} r={0.01} sombra={false} />
      <Caja s={[100, 0.2, 3.8]} p={[0, -0.14, 13.6]} c={PAL.hueso} r={0.01} sombra={false} />
      {[-18, -22, -26, -30, -34, -38].map((x) => (
        <Caja key={x} s={[1.6, 0.03, 0.12]} p={[x, 0.02, -10]} c={PAL.blanco} r={0.01} sombra={false} />
      ))}
      {Array.from({ length: 26 }, (_, i) => (
        <Caja key={i} s={[1.8, 0.03, 0.12]} p={[-50 + i * 4, -0.02, 13.6]} c={PAL.blanco} r={0.01} sombra={false} />
      ))}
      <Caja s={[6.6, 0.02, 7]} p={[-2.6, 0.005, -7.4]} c={PAL.hueso} r={0.01} sombra={false} />
      <Caja s={[4.4, 0.02, 15]} p={[9, 0.005, 1.8]} c={PAL.hueso} r={0.01} sombra={false} />
      {/* líneas guía */}
      {Array.from({ length: 12 }, (_, i) => (
        <Caja key={i} s={[0.7, 0.02, 0.1]} p={[-7.6 + i * 1.1, 0.02, -1.2]} c={PAL.claro} r={0.01} sombra={false} />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <Caja key={i} s={[0.1, 0.02, 0.7]} p={[6.4, 0.02, -1.1 + i * 1.1]} c={PAL.claro} r={0.01} sombra={false} />
      ))}
    </Entra>
    <Entra en={0.45}>
      <Almacen />
      <Silo x={-8.8} z={-12.6} acento />
      <Silo x={-6.3} z={-12.6} />
      <Coche p={[-3.6, 0, 1.4]} c={PAL.blanco} giro={Math.PI / 2} />
      <Coche p={[-2, 0, 1.4]} c={PAL.grafito} giro={Math.PI / 2} />
      <Coche p={[-0.4, 0, 1.4]} c={PAL.acento} giro={Math.PI / 2} />
    </Entra>
    {ARBOLES.map(([x, z, e], i) => (
      <Entra key={i} en={1.75 + (i % 6) * 0.05}>
        <Arbol p={[x, z]} e={e} i={i} />
      </Entra>
    ))}
    <Reparto />
    <Pin p={[-12.7, 3.2, -10]} en={ACTO.verde + 0.5} sale={ACTO.tueste - 0.3} />
    <Pin p={[-2.6, 8.4, -10]} en={ACTO.tueste + 0.1} sale={ACTO.enfria - 0.3} />
    <Pin p={[-2.6, 3, -4]} en={ACTO.enfria + 0.1} sale={ACTO.empaca - 0.3} />
    <Pin p={[9, 9, -4]} en={ACTO.empaca + 0.4} sale={ACTO.sale - 2.6} />
    <Pin p={[4, 5.2, 7.8]} en={ACTO.sale + 0.1} sale={ACTO.final - 0.3} />
  </>
);
