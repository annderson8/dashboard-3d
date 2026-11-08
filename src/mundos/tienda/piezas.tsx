// Piezas de la tienda online. Todo se mueve con useT().
import { useLayoutEffect, useRef } from "react";
import { InstancedMesh, Object3D } from "three";
import { Banda, Caja, Cil, frac, hash, limite, PAL, suave, useT } from "../../piezas/base";
import { Arbol, Flujo, Furgoneta, Persona } from "../../piezas/comunes";

const aux = new Object3D();

/** Estanterías llenas de cajas de colores y una carretilla que va y viene. */
export const Almacen: React.FC = () => {
  const t = useT();
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    let k = 0;
    for (let r = 0; r < 3; r++)
      for (let n = 0; n < 3; n++)
        for (let c = 0; c < 6; c++) {
          aux.position.set(-11 + c * 0.95, 0.75 + n * 1.25, -11 + r * 2.6);
          aux.quaternion.identity();
          aux.scale.setScalar(hash(k, 4) > 0.15 ? 1 : 0.001); // huecos: lo agotado
          aux.updateMatrix();
          m.setMatrixAt(k, aux.matrix);
          k++;
        }
    m.instanceMatrix.needsUpdate = true;
  }, []);
  const ida = frac(t / 8);
  const x = -11 + 5 * suave(limite(ida < 0.5 ? ida * 2 : 2 - ida * 2));
  return (
    <group>
      <Caja s={[8.4, 0.12, 8.6]} p={[-8.6, 0.06, -8.4]} c={PAL.hueso} r={0.03} />
      {[0, 1, 2].map((r) => (
        <group key={r}>
          {[0, 1, 2, 3].map((n) => (
            <Caja key={n} s={[6, 0.08, 0.95]} p={[-8.6, 0.12 + n * 1.25, -11 + r * 2.6]} c={PAL.acero} r={0.02} />
          ))}
          {[-11.6, -5.6].map((x) => (
            <Caja key={x} s={[0.1, 4, 0.95]} p={[x, 2, -11 + r * 2.6]} c={PAL.grafitoSuave} r={0.02} />
          ))}
        </group>
      ))}
      <instancedMesh ref={ref} args={[undefined, undefined, 54]} castShadow>
        <boxGeometry args={[0.8, 0.85, 0.8]} />
        <meshStandardMaterial color="#C9A982" roughness={0.8} />
      </instancedMesh>
      <group position={[x, 0, -6.1]}>
        <Caja s={[1.4, 0.5, 0.9]} p={[0, 0.45, 0]} c={PAL.esmeralda} r={0.12} />
        <Caja s={[0.08, 1.6, 0.8]} p={[0.75, 1, 0]} c={PAL.grafito} r={0.02} />
        <Persona p={[-0.3, 0.6, 0]} c={PAL.blanco} giro={Math.PI / 2} />
      </group>
    </group>
  );
};

/** Mesas de empaque y la banda que lleva las cajas al muelle. */
export const Preparacion: React.FC = () => (
  <group>
    {[-1.5, 1.5].map((z) => (
      <group key={z}>
        <Caja s={[3, 0.9, 1.2]} p={[-1.2, 0.45, -2 + z]} c={PAL.blanco} r={0.08} />
        <Caja s={[0.7, 0.5, 0.6]} p={[-1.6, 1.15, -2 + z]} c="#C9A982" r={0.04} />
        <Persona p={[-1.2, 0, -2 + z - 1.05]} c={PAL.claro} />
      </group>
    ))}
    <Banda a={[0.6, 1, -2]} b={[7, 1, -2]} vel={1.8} />
    <Flujo a={[0.6, 1, -2]} b={[7, 1, -2]} n={7} T={5} />
  </group>
);

/** Muelle de carga y furgonetas que salen por la calle. */
export const Reparto: React.FC = () => {
  const t = useT();
  return (
    <group>
      <Caja s={[5, 3.2, 4.4]} p={[9.6, 1.6, -2]} c={PAL.blanco} r={0.16} />
      <Caja s={[5.06, 0.3, 4.46]} p={[9.6, 3.2, -2]} c={PAL.esmeralda} r={0.05} />
      <Caja s={[0.08, 2, 2.4]} p={[7.06, 1, -2]} c={PAL.grafito} r={0.02} />
      {[0, 0.5].map((fase, i) => {
        const k = frac(t / 9 + fase);
        const z = k < 0.35 ? 9 - suave(k / 0.35) * 6 : k < 0.55 ? 3 : 3 + suave((k - 0.55) / 0.45) * 22;
        return (
          <group key={i} visible={z < 24}>
            <Furgoneta p={[9.6, 0, z]} />
          </group>
        );
      })}
    </group>
  );
};

/** Devoluciones: contenedores y cajas abiertas en revisión. */
export const Devoluciones: React.FC = () => {
  const t = useT();
  return (
    <group>
      <Caja s={[6, 0.12, 4.6]} p={[-7, 0.06, 5]} c={PAL.hueso} r={0.03} />
      {[-9, -7, -5].map((x, i) => (
        <group key={x}>
          <Cil r={0.8} r2={0.7} h={1.4} abierto p={[x, 0.7, 6.4]} c={i === 1 ? PAL.esmeralda : PAL.grafitoSuave} />
          <Caja s={[0.6, 0.5, 0.6]} p={[x, 1.35 + Math.sin(t * 1.5 + i) * 0.04, 6.4]} c="#C9A982" r={0.04} />
        </group>
      ))}
      <Caja s={[2.6, 0.9, 1.2]} p={[-7, 0.45, 3.8]} c={PAL.blanco} r={0.08} />
      <Persona p={[-7, 0, 2.8]} c={PAL.piedra} />
    </group>
  );
};

/** Losa, calle y árboles. */
export const Entorno: React.FC = () => (
  <group>
    <Caja s={[30, 0.24, 26]} p={[0, -0.12, -1]} c={PAL.blanco} r={0.1} />
    <Caja s={[4, 0.03, 60]} p={[9.6, 0.01, 10]} c={PAL.hueso} r={0.01} sombra={false} />
    {[
      [-13, 9],
      [-11, 10.5],
      [2, 9],
      [4, 10.6],
      [-2, 10],
      [13.5, -9],
      [13.5, -6],
    ].map(([x, z], i) => (
      <Arbol key={i} p={[x, z]} tono={i % 3 === 1 ? PAL.menta : PAL.claro} />
    ))}
  </group>
);
