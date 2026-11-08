// Curvas de animación (las mismas que usa Remotion, para que el movimiento se vea igual).
export type Curva = (x: number) => number;
export const cubica: Curva = (x) => x * x * x;
export const cuadratica: Curva = (x) => x * x;
export const atras =
  (s = 1.70158): Curva =>
  (x) =>
    x * x * ((s + 1) * x - s);
export const salida =
  (c: Curva): Curva =>
  (x) =>
    1 - c(1 - x);
export const entradaSalida =
  (c: Curva): Curva =>
  (x) =>
    x < 0.5 ? c(x * 2) / 2 : 1 - c((1 - x) * 2) / 2;
