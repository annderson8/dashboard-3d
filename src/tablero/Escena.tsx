import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Vector3, type Mesh, type MeshBasicMaterial, type OrthographicCamera } from "three";
import { color } from "../piezas/tema";
import { RelojCtx, Tiempo } from "../piezas/tiempo";
import type { V3 } from "../piezas/base";
import type { Zona as ZonaMundo } from "../mundos/tipos";
import { MUNDO } from "../mundo";

type Id = string;

/** `rapido`: viene del arrastre o la rueda y se aplica casi al instante. */
export type Vista = { a: V3; az: number; elev: number; zoom: number; rapido?: boolean };
export type PropsMundo = {
  alSeleccionar: (id: Id) => void;
  alHover: (id: Id | null) => void;
};

/**
 * Lo que la app le pide a la escena (vista, selección, puntero). Va por aquí y no por las props del reproductor:
 * esas llegan con retraso, y la cámara tardaba en reaccionar. La escena lo lee en cada fotograma.
 */
export const ESTADO: { vista: Vista | null; seleccion: Id | null; hover: Id | null; paradas: Record<Id, number | undefined> } = {
  vista: null,
  seleccion: null,
  hover: null,
  paradas: {},
};

/** Posición en pantalla de cada estación, para dibujar las tarjetas flotantes encima del canvas. */
export const ANCLAS: Record<Id, { x: number; y: number } | undefined> = {};

const rad = (g: number) => (g * Math.PI) / 180;

/** Cámara de maqueta. Cada cambio de vista es un vuelo de duración fija en tiempo real; arrastrar (`rapido`) responde al instante. */
const CamaraLibre: React.FC = () => {
  const camera = useThree((s) => s.camera) as OrthographicCamera;
  const size = useThree((s) => s.size);
  const vuelo = useRef<{ desde: Vista; hacia: Vista; t0: number } | null>(null);
  const actual = useRef<Vista | null>(null);
  useFrame(() => {
    const objetivo = ESTADO.vista;
    if (!objetivo) return;
    const ahora = performance.now();
    if (!vuelo.current || vuelo.current.hacia !== objetivo) vuelo.current = { desde: actual.current ?? objetivo, hacia: objetivo, t0: ahora };
    const { desde, hacia, t0 } = vuelo.current;
    const dur = hacia.rapido ? 90 : 800;
    const p = Math.min(1, (ahora - t0) / dur);
    const k = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    const mezcla = (x: number, y: number) => x + (y - x) * k;
    const v: Vista = {
      a: [mezcla(desde.a[0], hacia.a[0]), mezcla(desde.a[1], hacia.a[1]), mezcla(desde.a[2], hacia.a[2])],
      az: mezcla(desde.az, hacia.az),
      elev: mezcla(desde.elev, hacia.elev),
      zoom: Math.exp(mezcla(Math.log(desde.zoom), Math.log(hacia.zoom))),
    };
    actual.current = v;
    const d = 120;
    camera.position.set(
      v.a[0] + d * Math.cos(rad(v.elev)) * Math.sin(rad(v.az)),
      v.a[1] + d * Math.sin(rad(v.elev)),
      v.a[2] + d * Math.cos(rad(v.elev)) * Math.cos(rad(v.az)),
    );
    camera.zoom = v.zoom;
    camera.lookAt(v.a[0], v.a[1], v.a[2]);
    // Con el panel abierto (360 px a la derecha), la estación se centra en la parte que queda visible.
    const corrimiento = ESTADO.seleccion ? Math.min(360, size.width - 32) / 2 + 8 : 0;
    camera.setViewOffset(size.width, size.height, corrimiento, 0, size.width, size.height);
    camera.updateProjectionMatrix();
  });
  return null;
};

const punto = new Vector3();
/** Proyecta las anclas a píxeles. Va montado después de la cámara, así corre detrás de ella; sin prioridad propia, porque con prioridad R3F deja de dibujar solo. */
const Proyector: React.FC = () => {
  const { camera, size } = useThree();
  useFrame(() => {
    for (const e of MUNDO.zonas) {
      punto.set(...e.ancla).project(camera);
      ANCLAS[e.id] = { x: ((punto.x + 1) / 2) * size.width, y: ((1 - punto.y) / 2) * size.height };
    }
  });
  return null;
};

/** Caja invisible que recibe el clic y el puntero de una estación, y el aro del suelo que la marca. */
const Zona: React.FC<{ e: ZonaMundo; alSeleccionar: (id: Id) => void; alHover: (id: Id | null) => void }> = ({ e, alSeleccionar, alHover }) => {
  const aro = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    const m = aro.current;
    if (!m) return;
    const activa = ESTADO.seleccion === e.id;
    m.visible = activa || ESTADO.hover === e.id;
    m.scale.setScalar(activa ? 1 + Math.sin(clock.elapsedTime * 3) * 0.03 : 1);
    (m.material as MeshBasicMaterial).opacity = activa ? 0.95 : 0.5;
  });
  const radio = Math.max(e.zona.tam[0], e.zona.tam[2]) / 2 + 0.7;
  return (
    <>
      <mesh
        position={e.zona.centro}
        onPointerOver={(ev) => {
          ev.stopPropagation();
          alHover(e.id);
        }}
        onPointerOut={() => alHover(null)}
        onClick={(ev) => {
          ev.stopPropagation();
          if (ev.delta < 6) alSeleccionar(e.id);
        }}
      >
        <boxGeometry args={e.zona.tam} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={aro} visible={false} position={[e.zona.centro[0], 0.03, e.zona.centro[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radio - 0.16, radio, 72]} />
        <meshBasicMaterial color={color.esmeralda} transparent opacity={0.5} toneMapped={false} />
      </mesh>
    </>
  );
};

export const Escena: React.FC<PropsMundo> = ({ alSeleccionar, alHover }) => {
  return (
    <Canvas orthographic flat shadows dpr={[1, 2]} camera={{ near: 1, far: 400, position: [80, 70, 80], zoom: 40 }} style={{ width: "100%", height: "100%" }}>
      <Tiempo>
      <RelojCtx.Provider value={(t) => MUNDO.arranque + t}>
        <color attach="background" args={[color.niebla]} />
        <CamaraLibre />
        <Proyector />
        <hemisphereLight args={["#ffffff", "#ECEEF1", 2.3]} />
        <directionalLight
          position={[-34, 52, 16]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[4096, 4096]}
          shadow-camera-left={-46}
          shadow-camera-right={46}
          shadow-camera-top={46}
          shadow-camera-bottom={-46}
          shadow-camera-near={1}
          shadow-camera-far={160}
          shadow-bias={-0.0004}
          shadow-normalBias={0.03}
          shadow-radius={3}
        />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.24, 0]} receiveShadow>
          <planeGeometry args={[400, 400]} />
          <shadowMaterial color={color.piedra} opacity={0.22} />
        </mesh>
        <MUNDO.Planta paradaDesde={(id) => ESTADO.paradas[id]} />
        {MUNDO.zonas.map((e) => (
          <Zona key={e.id} e={e} alSeleccionar={alSeleccionar} alHover={alHover} />
        ))}
      </RelojCtx.Provider>
      </Tiempo>
    </Canvas>
  );
};
