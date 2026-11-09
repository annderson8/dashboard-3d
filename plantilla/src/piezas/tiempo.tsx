import { createContext, useContext, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";

/**
 * El reloj del mundo. Todas las piezas se mueven en función de un tiempo `t` (segundos) y no de su propio estado,
 * así una escena siempre se ve igual en el mismo segundo: se puede congelar, acelerar o saltar a otro momento.
 */
const TiempoCtx = createContext(0);

/** Segundo actual, también para quien está fuera del canvas (p. ej. para saber cuándo paró una máquina). */
export const RELOJ = { ahora: 0 };

/** Convierte el tiempo del reloj en tiempo del mundo: saltar a un momento, cámara lenta, congelar. */
export const RelojCtx = createContext<(s: number) => number>((s) => s);

/** Va dentro del <Canvas>. Avanza el reloj a ~30 fps: suficiente para el movimiento y deja respirar al navegador. */
export const Tiempo: React.FC<{ children: React.ReactNode; fps?: number }> = ({ children, fps = 30 }) => {
  const [t, setT] = useState(0);
  const ultimo = useRef(0);
  useFrame(({ clock }) => {
    const ahora = clock.elapsedTime;
    RELOJ.ahora = ahora;
    if (ahora - ultimo.current >= 1 / fps) {
      ultimo.current = ahora;
      setT(ahora);
    }
  });
  return <TiempoCtx.Provider value={t}>{children}</TiempoCtx.Provider>;
};

/** Segundo del reloj, sin pasar por RelojCtx. */
export const useReloj = () => useContext(TiempoCtx);
/** Segundo del mundo para esta pieza. */
export const useT = () => useContext(RelojCtx)(useContext(TiempoCtx));
