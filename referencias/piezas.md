# Piezas de src/piezas/

Todas aceptan posición `p: [x, y, z]`, rotación `rot` (radianes) y color `c` (usa los tonos de `PAL`).

## Formas (`base.tsx`)
| Pieza | Props principales | Para qué |
| --- | --- | --- |
| `<Caja s={[w, h, d]} r={0.07} />` | `s` tamaño, `r` radio del redondeo, `rug` rugosidad, `sombra` | Edificios, máquinas, cajas, carteles |
| `<Cil r={1} r2={0.5} h={2} abierto />` | `r` radio arriba, `r2` abajo, `lados`, `abierto` (sin tapas) | Silos, tolvas, ruedas, chimeneas |
| `<Esfera r={0.7} escala={[1, 1.2, 1]} />` | `escala` para óvalos | Árboles, cabezas, pilotos |
| `<Banda a={[x,y,z]} b={[x,y,z]} vel={3} />` | `ancho`, `vel`, `desde` (segundo en que arranca) | Cintas transportadoras con patas |
| `<Entra en={0.5}>…</Entra>` | `en`: segundo en que cae | Que la zona aparezca cayendo al arrancar |
| `<Congela desde={…}>…</Congela>` | `desde`: segundo en que paró (o `undefined`) | Detener una zona en "parada" |

Tonos: `PAL.grafito`, `PAL.grafitoSuave`, `PAL.piedra`, `PAL.acero`, `PAL.hueso`, `PAL.blanco`, `PAL.acento`, `PAL.claro`, `PAL.menta`.
Material propio: `mat(color, rugosidad, { emisivo, brillo })`.

## Ayudas de tiempo (`base.tsx`)
- `useT()` → segundo del mundo.
- `frac(x)` → parte decimal (ciclos). `limite(x, a, b)` → recorta. `suave` → curva de entrada y salida.
- `tramo(t, [desde, hasta])` → 0 → 1 con curva suave entre dos segundos.
- `hash(i, semilla)` → número 0–1 fijo para la pieza `i` (variedad sin aleatoriedad).

## Comunes (`comunes.tsx`): sirven para casi cualquier negocio
| Pieza | Props principales | Para qué |
| --- | --- | --- |
| `<Persona p c giro />` | `c` color de la ropa | Gente trabajando o esperando |
| `<Arbol p={[x, z]} e tono />` | `e` escala | Decorar los bordes y huecos |
| `<Furgoneta p giro acento />` | Mírala hacia `+z`; muévela cambiando `p` con `useT()` | Reparto, llegadas, salidas |
| `<Flujo a b n T tam color />` | `n` a la vez, `T` segundos de recorrido | Cajas, sobres o paquetes que circulan; ponlo encima de una `<Banda>` con los mismos `a` y `b` |

## Partículas (`granos.tsx`)
Tienen forma de grano de café; para otro negocio copia la pieza y cambia la geometría (cajas, paquetes, gotas).
| Pieza | Para qué |
| --- | --- |
| `<Corriente n ruta={[[x,y,z], …]} T desde tinte />` | Un flujo continuo por una ruta (lo que circula por una banda o cae por una rampa) |
| `<Monton n centro radio nivel tinte />` | Un montón que se vacía con `nivel` 0–1 |
| `<Humo origen desde />` | Humo o vapor que sube |
| `<Disco …/>` y `<Cascada …/>` | Material girando en una bandeja o cayendo dentro de un tambor |

## Ejemplos completos
En `ejemplos/` de la skill:
- `tienda/mundo/`: tienda online (almacén con estanterías, preparación, reparto y devoluciones) hecha solo con piezas del kit. El mejor punto de partida para un negocio que no fabrica nada.
- `gimnasio/mundo/`: gimnasio con salas, máquinas, piscina y clases, y varias reglas de estado en su `datos.csv`. Buen modelo para un negocio de servicios con salas.
- `tostadora/mundo/maquinas.tsx`: tostadora con tambor visible, bandeja de enfriado, empacadora.
- `tostadora/mundo/bolsas.tsx`: línea de bolsas por estaciones y un brazo robot con cinemática inversa.
- `tostadora/mundo/entorno.tsx`: losa, caminos, árboles, coches y almacén.
