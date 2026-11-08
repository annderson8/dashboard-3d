// Guion de la tostadora: cuándo llega el camión, cuándo se tuesta, cuándo arrancan las bolsas…
// El tablero la muestra ya en marcha (segundo 22 en adelante), así que todo esto pasó "antes de abrir".
const c = 2.4; // un compás a 100 BPM: la planta se pensó para un video con música

export const ACTO = { arma: 0, verde: c, tueste: 3 * c, enfria: 5 * c, empaca: 6 * c, sale: 8 * c, final: 9 * c, fin: 11 * c };

export const PLANTA = {
  camionLlega: [ACTO.verde, ACTO.verde + 1.3],
  volteo: [ACTO.verde + 1.4, ACTO.verde + 2.2],
  descarga: [ACTO.verde + 1.8, ACTO.verde + 4.2],
  volteoBaja: [ACTO.verde + 4.3, ACTO.verde + 4.9],
  camionSale: [ACTO.verde + 5.2, ACTO.verde + 6.6],
  banda1: ACTO.verde + 2.1,
  llenaTambor: [ACTO.tueste + 0.1, ACTO.tueste + 1.6],
  tueste: [ACTO.tueste + 0.6, ACTO.enfria - 0.2],
  descargaTambor: ACTO.enfria - 0.1,
  llenaBandeja: [ACTO.enfria, ACTO.enfria + 1.5],
  banda2: ACTO.enfria + 1.3,
  bolsas: 8,
};

/** Duración de un ciclo de empaque: una bolsa avanza una estación y el brazo coloca una. */
export const CICLO = 1.3;
