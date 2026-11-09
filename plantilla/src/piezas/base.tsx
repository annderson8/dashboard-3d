import { createContext, useContext, useLayoutEffect, useRef } from "react";
import { CylinderGeometry, DoubleSide, InstancedMesh, MeshStandardMaterial, Object3D, SphereGeometry, Vector3 } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { color } from "./tema";
import { atras, cubica, entradaSalida, salida } from "./curvas";
import { RelojCtx, useReloj, useT } from "./tiempo";

export { RelojCtx, useT };

/** Congela lo que lleva dentro desde el segundo `desde` del reloj (p. ej. una máquina parada en el CSV). Sin `desde`, no hace nada. */
export const Congela: React.FC<{ desde?: number; children: React.ReactNode }> = ({ desde, children }) => {
  const reloj = useContext(RelojCtx);
  useReloj(); // vuelve a pintarse con cada tic: nota el cambio de estado al instante
  return <RelojCtx.Provider value={desde === undefined ? reloj : () => reloj(desde)}>{children}</RelojCtx.Provider>;
};

// Primitivas de la planta. Todo sale de la paleta de marca: el acento sale de marca.json.
export const PAL = {
  grafito: color.grafito,
  grafitoSuave: color.grafitoSuave,
  piedra: color.piedra,
  acero: color.acero,
  hueso: color.hueso,
  blanco: color.blanco,
  borde: color.borde,
  acento: color.acento,
  claro: color.acentoClaro,
  menta: color.textoSobreAcento,
};

export type V3 = [number, number, number];

/** Oculta los pines en los primeros planos, donde estorban. */
export const SinPinesCtx = createContext(false);


export const limite = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const frac = (x: number) => x - Math.floor(x);
export const hash = (i: number, s = 0) => frac(Math.sin(i * 127.1 + s * 311.7) * 43758.5453);
export const suave = entradaSalida(cubica);
/** 0→1 entre dos segundos, con curva suave. */
export const tramo = (t: number, [a, b]: readonly number[]) => suave(limite((t - a) / (b - a)));

const geos = new Map<string, unknown>();
const memo = <T,>(clave: string, crear: () => T): T => {
  if (!geos.has(clave)) geos.set(clave, crear());
  return geos.get(clave) as T;
};

export const mat = (c: string, rugosidad = 0.62, extra: { emisivo?: string; brillo?: number; doble?: boolean; metal?: number } = {}) =>
  memo(`m${c}${rugosidad}${JSON.stringify(extra)}`, () =>
    new MeshStandardMaterial({
      color: c,
      roughness: rugosidad,
      metalness: extra.metal ?? 0,
      emissive: extra.emisivo ?? "#000000",
      emissiveIntensity: extra.brillo ?? 1,
      side: extra.doble ? DoubleSide : undefined,
    }),
  );

type Comun = { p?: V3; rot?: V3; c?: string; rug?: number; sombra?: boolean };

export const Caja: React.FC<Comun & { s: V3; r?: number }> = ({ s, r = 0.07, p, rot, c = PAL.hueso, rug, sombra = true }) => {
  const radio = Math.min(r, Math.min(...s) / 2 - 0.001);
  const geo = memo(`c${s}${radio}`, () => new RoundedBoxGeometry(s[0], s[1], s[2], 3, radio));
  return <mesh geometry={geo} material={mat(c, rug)} position={p} rotation={rot} castShadow={sombra} receiveShadow />;
};

export const Cil: React.FC<Comun & { r: number; r2?: number; h: number; lados?: number; abierto?: boolean }> = ({ r, r2, h, lados = 40, abierto = false, p, rot, c = PAL.acero, rug, sombra = true }) => {
  const geo = memo(`l${r}${r2}${h}${lados}${abierto}`, () => new CylinderGeometry(r, r2 ?? r, h, lados, 1, abierto));
  return <mesh geometry={geo} material={abierto ? mat(c, rug, { doble: true }) : mat(c, rug)} position={p} rotation={rot} castShadow={sombra} receiveShadow />;
};

export const Esfera: React.FC<Comun & { r: number; escala?: V3 }> = ({ r, escala, p, c = PAL.blanco, rug, sombra = true }) => {
  const geo = memo(`e${r}`, () => new SphereGeometry(r, 28, 20));
  return <mesh geometry={geo} material={mat(c, rug)} position={p} scale={escala} castShadow={sombra} receiveShadow />;
};

/** Cae desde arriba y aterriza con un pequeño rebote: así se arma la planta al principio. */
export const Entra: React.FC<{ en: number; children: React.ReactNode }> = ({ en, children }) => {
  const t = useT();
  const p = limite((t - en) / 0.55);
  const y = (1 - salida(atras(1.5))(p)) * 13;
  return (
    <group position={[0, y, 0]} visible={p > 0}>
      {children}
    </group>
  );
};

const auxiliar = new Object3D();

/** Banda transportadora entre dos puntos: tablillas que corren, barandas y patas hasta el suelo. */
export const Banda: React.FC<{ a: V3; b: V3; ancho?: number; vel?: number; paso?: number; desde?: number }> = ({ a, b, ancho = 1.15, vel = 3, paso = 0.55, desde = 0 }) => {
  const t = useT();
  const inicio = new Vector3(...a);
  const dir = new Vector3(...b).sub(inicio);
  const largo = dir.length();
  dir.normalize();
  const n = Math.round(largo / paso);
  const ref = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    for (let i = 0; i < n; i++) {
      auxiliar.position.set(frac(i / n + (Math.max(0, t - desde) * vel) / largo) * largo - largo / 2, 0.075, 0);
      auxiliar.updateMatrix();
      m.setMatrixAt(i, auxiliar.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [t, n, largo, vel, desde]);

  const lateral = new Vector3(0, 1, 0).cross(dir).normalize();
  const medio = inicio.clone().addScaledVector(dir, largo / 2);
  const tablilla = memo(`t${ancho}`, () => new RoundedBoxGeometry(0.1, 0.05, ancho - 0.06, 2, 0.02));
  const patas: V3[] = [];
  const cuantas = Math.max(2, Math.round(largo / 3.6));
  for (let i = 0; i < cuantas; i++) {
    const k = (i + 0.5) / cuantas;
    for (const lado of [-1, 1]) {
      const q = inicio.clone().addScaledVector(dir, largo * k).addScaledVector(lateral, (lado * ancho) / 2 + lado * 0.12);
      patas.push([q.x, q.y, q.z]);
    }
  }

  return (
    <>
      <group position={medio} ref={(g) => g?.quaternion.setFromUnitVectors(new Vector3(1, 0, 0), dir)}>
        <Caja s={[largo, 0.16, ancho]} p={[0, -0.03, 0]} c={PAL.grafitoSuave} r={0.05} />
        <Caja s={[largo + 0.16, 0.2, 0.09]} p={[0, 0.03, ancho / 2 + 0.05]} c={PAL.blanco} r={0.03} />
        <Caja s={[largo + 0.16, 0.2, 0.09]} p={[0, 0.03, -ancho / 2 - 0.05]} c={PAL.blanco} r={0.03} />
        <instancedMesh ref={ref} args={[tablilla, mat(PAL.piedra), n]} frustumCulled={false} />
      </group>
      {patas.map((q, i) => (
        <Caja key={i} s={[0.13, q[1], 0.13]} p={[q[0], q[1] / 2, q[2]]} c={PAL.acero} r={0.03} />
      ))}
    </>
  );
};
