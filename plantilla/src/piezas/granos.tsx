import { createContext, useContext, useLayoutEffect, useMemo, useRef } from "react";
import { Color, InstancedMesh, MeshStandardMaterial, Object3D, SphereGeometry, Vector3 } from "three";
import { frac, hash, limite, PAL, useT, type V3 } from "./base";

/** Grano de café: elipsoide con una cara plana y la hendidura central. */
const crearGrano = () => {
  const g = new SphereGeometry(1, 20, 14);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) * 1.28;
    let y = p.getY(i);
    const z = p.getZ(i) * 0.9;
    y = y > 0 ? y * 0.42 - 0.24 * Math.exp(-((z / 0.17) ** 2)) : y * 0.74;
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  g.scale(0.115, 0.115, 0.115);
  return g;
};
const GRANO = crearGrano();
const MATERIAL = new MeshStandardMaterial({ color: "#ffffff", roughness: 0.4 });
const MATERIAL_CRUDO = new MeshStandardMaterial({ color: "#ffffff", roughness: 0.85 }); // el grano crudo es mate

// Color real del café crudo: verde pálido tirando a amarillo. Es el único tono fuera de la paleta de marca, a propósito.
export const CRUDO = "#BFC18F";
export const VERDE = new Color(CRUDO);
// El tostado es café oscuro, no negro: en negro parece quemado (Annder, 2026-11-07).
export const TOSTADO_HEX = "#4B2D1E";
export const TOSTADO = new Color(TOSTADO_HEX);
const materialDe = (tinte: Color) => (tinte === VERDE ? MATERIAL_CRUDO : MATERIAL);

/** true = el error del primer intento: el grano crudo en esmeralda brillante, como lo pintó Claude. */
export const BrillanteCtx = createContext(false);
const ESMERALDA = new Color(PAL.claro);
const useCrudo = (tinte: Color) => (useContext(BrillanteCtx) && tinte === VERDE ? ESMERALDA : tinte);
const useMaterial = (tinte: Color) => (useContext(BrillanteCtx) && tinte === VERDE ? MATERIAL : materialDe(tinte));
const tono = new Color();
const aux = new Object3D();
const OCULTO = 0.00001;

/** Pinta cada grano con una pequeña variación: un tono idéntico en cientos de piezas se ve a plástico. */
const pintar = (m: InstancedMesh, i: number, base: Color) => {
  tono.copy(base).multiplyScalar(0.82 + hash(i, 9) * 0.36);
  m.setColorAt(i, tono);
};
const cerrar = (m: InstancedMesh) => {
  m.instanceMatrix.needsUpdate = true;
  if (m.instanceColor) m.instanceColor.needsUpdate = true;
};

const prepara = (ruta: V3[]) => {
  const pts = ruta.map((p) => new Vector3(...p));
  const acum = [0];
  for (let i = 1; i < pts.length; i++) acum.push(acum[i - 1] + pts[i].distanceTo(pts[i - 1]));
  return { pts, acum, total: acum[acum.length - 1] };
};

const lugar = new Vector3();
const enRuta = ({ pts, acum, total }: ReturnType<typeof prepara>, s: number) => {
  const d = s * total;
  let i = 1;
  while (i < acum.length - 1 && acum[i] < d) i++;
  return lugar.lerpVectors(pts[i - 1], pts[i], (d - acum[i - 1]) / (acum[i] - acum[i - 1]));
};

/**
 * Corriente continua de granos. Es una función pura del tiempo: el grano i siempre está en
 * frac(t/T + i/n) de la ruta, y solo se ve si nació dentro de [desde, hasta].
 */
export const Corriente: React.FC<{
  n: number;
  ruta: V3[];
  T: number;
  desde: number;
  hasta?: number;
  tinte: Color;
  ancho?: number;
  eje?: V3;
  alto?: number;
}> = ({ n, ruta, T, desde, hasta = Infinity, tinte: base, ancho = 0.8, eje = [0, 0, 1], alto = 0.14 }) => {
  const ref = useRef<InstancedMesh>(null);
  const t = useT();
  const tinte = useCrudo(base);
  const material = useMaterial(base);
  const camino = useMemo(() => prepara(ruta), [ruta]);

  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    for (let i = 0; i < n; i++) {
      const s = frac(t / T + i / n);
      const nacio = t - s * T;
      const ve = nacio >= desde && nacio <= hasta;
      const p = enRuta(camino, s);
      const lado = (hash(i, 1) - 0.5) * ancho;
      aux.position.set(p.x + eje[0] * lado, p.y + hash(i, 2) * alto, p.z + eje[2] * lado);
      aux.rotation.set(hash(i, 3) * 6.28, hash(i, 4) * 6.28 + t * 2, hash(i, 5) * 6.28);
      aux.scale.setScalar(ve ? 1 : OCULTO);
      aux.updateMatrix();
      m.setMatrixAt(i, aux.matrix);
      pintar(m, i, tinte);
    }
    cerrar(m);
  }, [t, n, T, desde, hasta, tinte, ancho, eje, alto, camino]);

  return <instancedMesh ref={ref} args={[GRANO, material, n]} castShadow frustumCulled={false} />;
};

/** Granos cayendo en cascada dentro del tambor: suben pegados a la pared y caen por el centro. */
export const Cascada: React.FC<{ n: number; centro: V3; radio: number; largo: number; llena: readonly number[]; tueste: readonly number[] }> = ({ n, centro, radio, largo, llena, tueste }) => {
  const ref = useRef<InstancedMesh>(null);
  const t = useT();
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const avance = limite((t - tueste[0]) / (tueste[1] - tueste[0]));
    tono.copy(VERDE).lerp(TOSTADO, avance);
    const base = tono.clone();
    for (let i = 0; i < n; i++) {
      const entro = t >= llena[0] + (i / n) * (llena[1] - llena[0]);
      const f = 0.45 + hash(i, 1) * 0.18;
      const fase = frac(t * f + hash(i, 2));
      const r = radio * (0.66 + 0.34 * Math.sqrt(hash(i, 3)));
      const abajo = -Math.PI / 2 - 0.85 + hash(i, 4) * 0.6;
      const arriba = 0.35 + hash(i, 5) * 0.55;
      let x: number, y: number;
      if (fase < 0.68) {
        const a = abajo + (arriba - abajo) * (fase / 0.68);
        x = Math.cos(a) * r;
        y = Math.sin(a) * r;
      } else {
        const k = (fase - 0.68) / 0.32;
        const x0 = Math.cos(arriba) * r;
        const y0 = Math.sin(arriba) * r;
        const x1 = Math.cos(abajo) * r;
        const y1 = Math.sin(abajo) * r;
        x = x0 + (x1 - x0) * k;
        y = y0 + (y1 - y0) * k * k;
      }
      aux.position.set(centro[0] + x, centro[1] + y, centro[2] + (hash(i, 6) - 0.5) * largo);
      aux.rotation.set(hash(i, 7) * 6.28 + t * 3, hash(i, 8) * 6.28 + t * 2.4, t * 4);
      aux.scale.setScalar(entro ? 1 + avance * 0.28 : OCULTO); // el grano se hincha al tostarse
      aux.updateMatrix();
      m.setMatrixAt(i, aux.matrix);
      pintar(m, i, base);
    }
    cerrar(m);
  }, [t, n, centro, radio, largo, llena, tueste]);
  return <instancedMesh ref={ref} args={[GRANO, MATERIAL, n]} frustumCulled={false} />;
};

/** Café extendido en la bandeja, girando empujado por los brazos. */
export const Disco: React.FC<{ n: number; centro: V3; radio: number; llena: readonly number[]; vel: number }> = ({ n, centro, radio, llena, vel }) => {
  const ref = useRef<InstancedMesh>(null);
  const t = useT();
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    for (let i = 0; i < n; i++) {
      const r = 0.42 + Math.sqrt(hash(i, 1)) * (radio - 0.42);
      const a = hash(i, 2) * 6.283 + t * vel * (0.75 + hash(i, 3) * 0.25);
      const entro = t >= llena[0] + hash(i, 4) * (llena[1] - llena[0]);
      aux.position.set(centro[0] + Math.cos(a) * r, centro[1] + hash(i, 5) * 0.16, centro[2] + Math.sin(a) * r);
      aux.rotation.set(hash(i, 6) * 6.28, hash(i, 7) * 6.28, hash(i, 8) * 6.28);
      aux.scale.setScalar(entro ? 1.2 : OCULTO);
      aux.updateMatrix();
      m.setMatrixAt(i, aux.matrix);
      pintar(m, i, TOSTADO);
    }
    cerrar(m);
  }, [t, n, centro, radio, llena, vel]);
  return <instancedMesh ref={ref} args={[GRANO, MATERIAL, n]} castShadow frustumCulled={false} />;
};

/** Montón fijo de granos sobre un casquete; `nivel` lo va vaciando. */
export const Monton: React.FC<{ n: number; centro: V3; radio: V3; nivel: number; tinte: Color }> = ({ n, centro, radio, nivel, tinte: base }) => {
  const ref = useRef<InstancedMesh>(null);
  const tinte = useCrudo(base);
  const material = useMaterial(base);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    for (let i = 0; i < n; i++) {
      const a = hash(i, 1) * 6.283;
      const u = Math.sqrt(hash(i, 2));
      const y = Math.sqrt(Math.max(0, 1 - u * u));
      aux.position.set(centro[0] + Math.cos(a) * u * radio[0], centro[1] + y * radio[1] * nivel, centro[2] + Math.sin(a) * u * radio[2]);
      aux.rotation.set(hash(i, 3) * 6.28, hash(i, 4) * 6.28, hash(i, 5) * 6.28);
      aux.scale.setScalar(nivel > 0.02 ? 1.35 : OCULTO);
      aux.updateMatrix();
      m.setMatrixAt(i, aux.matrix);
      pintar(m, i, tinte);
    }
    cerrar(m);
  }, [n, centro, radio, nivel, tinte]);
  return <instancedMesh ref={ref} args={[GRANO, material, n]} castShadow frustumCulled={false} />;
};

/** Humo o vapor: bolas blancas que suben, crecen y desaparecen. */
export const Humo: React.FC<{ origen: V3; n?: number; T?: number; subida?: number; desde: number; hasta?: number; tam?: number }> = ({ origen, n = 16, T = 2.6, subida = 5, desde, hasta = Infinity, tam = 0.7 }) => {
  const ref = useRef<InstancedMesh>(null);
  const t = useT();
  const geo = useMemo(() => new SphereGeometry(1, 18, 14), []);
  const mat = useMemo(() => new MeshStandardMaterial({ color: "#ffffff", roughness: 1 }), []);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    for (let i = 0; i < n; i++) {
      const e = frac(t / T + i / n);
      const nacio = t - e * T;
      const ve = nacio >= desde && nacio <= hasta;
      const deriva = Math.sin(e * 3 + hash(i, 1) * 6) * 0.5 * e;
      aux.position.set(origen[0] + deriva + e * 1.4, origen[1] + e * subida, origen[2] + (hash(i, 2) - 0.5) * 0.7 - e * 0.8);
      aux.rotation.set(0, 0, 0);
      aux.scale.setScalar(ve ? tam * (0.4 + e * 1.3) * Math.min(1, (1 - e) * 3.2) * (0.8 + hash(i, 3) * 0.4) : OCULTO);
      aux.updateMatrix();
      m.setMatrixAt(i, aux.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [t, n, T, subida, desde, hasta, tam, origen]);
  return <instancedMesh ref={ref} args={[geo, mat, n]} frustumCulled={false} />;
};
