// Piezas que sirven para casi cualquier negocio: gente, árboles, furgonetas y cosas que circulan.
import { useLayoutEffect, useRef } from "react";
import { InstancedMesh, Object3D, Quaternion, Vector3 } from "three";
import { Caja, Cil, Esfera, frac, hash, PAL, useT, type V3 } from "./base";

const aux = new Object3D();

/** Una persona sencilla. `c`: color de la ropa. */
export const Persona: React.FC<{ p: V3; c?: string; giro?: number }> = ({ p, c = PAL.piedra, giro = 0 }) => (
  <group position={p} rotation={[0, giro, 0]}>
    <Caja s={[0.42, 0.86, 0.3]} p={[0, 0.43, 0]} c={c} r={0.14} />
    <Esfera r={0.18} p={[0, 1.04, 0]} c={PAL.hueso} />
  </group>
);

/** Árbol redondeado. `e`: escala. */
export const Arbol: React.FC<{ p: [number, number]; e?: number; tono?: string }> = ({ p, e = 1, tono = PAL.claro }) => (
  <group position={[p[0], 0, p[1]]} scale={e}>
    <Cil r={0.1} r2={0.15} h={1} lados={10} p={[0, 0.5, 0]} c={PAL.piedra} />
    <Esfera r={0.72} p={[0, 1.5, 0]} escala={[1, 1.15, 1]} c={tono} rug={0.8} />
  </group>
);

/** Furgoneta de reparto mirando hacia +z. Muévela cambiando `p` con useT(). */
export const Furgoneta: React.FC<{ p: V3; giro?: number; acento?: string }> = ({ p, giro = 0, acento = PAL.esmeralda }) => (
  <group position={p} rotation={[0, giro, 0]}>
    <Caja s={[1.9, 1.9, 3.4]} p={[0, 1.25, 0]} c={PAL.blanco} r={0.18} />
    <Caja s={[1.92, 0.35, 3.42]} p={[0, 0.9, 0]} c={acento} r={0.04} />
    <Caja s={[1.82, 0.55, 0.4]} p={[0, 1.6, 1.62]} c={PAL.grafito} r={0.08} />
    {[-1.1, 1.1].map((dz) =>
      [-0.95, 0.95].map((dx) => <Cil key={`${dx}${dz}`} r={0.35} h={0.24} lados={18} p={[dx, 0.35, dz]} rot={[0, 0, Math.PI / 2]} c={PAL.grafito} />),
    )}
  </group>
);

/**
 * Cosas que circulan en línea recta de `a` a `b` (cajas en una banda, sobres, paquetes): `n` a la vez, cada una tarda `T` segundos.
 * Ponla encima de una `<Banda>` con los mismos `a` y `b`.
 */
export const Flujo: React.FC<{ a: V3; b: V3; n?: number; T?: number; tam?: V3; color?: string }> = ({
  a,
  b,
  n = 8,
  T = 6,
  tam = [0.55, 0.42, 0.47],
  color = "#C9A982",
}) => {
  const ref = useRef<InstancedMesh>(null);
  const t = useT();
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const A = new Vector3(...a);
    const B = new Vector3(...b);
    const q = new Quaternion().setFromUnitVectors(new Vector3(1, 0, 0), B.clone().sub(A).setY(0).normalize());
    for (let i = 0; i < n; i++) {
      aux.position.lerpVectors(A, B, frac(t / T + i / n));
      aux.position.y += tam[1] / 2 + 0.08;
      aux.quaternion.copy(q);
      aux.scale.setScalar(1 + (hash(i, 2) - 0.5) * 0.3);
      aux.updateMatrix();
      m.setMatrixAt(i, aux.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [t, n, T, tam, a, b]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, n]} castShadow frustumCulled={false}>
      <boxGeometry args={tam} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </instancedMesh>
  );
};
