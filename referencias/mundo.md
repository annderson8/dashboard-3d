# Cómo colocar un mundo

## Ejes y cámara
- `y` hacia arriba. El suelo está en `y = 0`. Una unidad ≈ un metro de maqueta.
- La cámara es ortográfica y mira desde `+x +z` (azimut 46°, elevación 35°). En pantalla:
  - `+x` y `-z` van hacia la **derecha**.
  - `+x` y `+z` van hacia **abajo**.
- Un recorrido que va hacia abajo en pantalla queda bien en vertical. Uno largo en `x` sale ancho: si el negocio tiene muchas zonas, colócalas en zigzag.

## Tamaños que funcionan
- La losa base: unos 30 × 28 (`<Caja s={[30, 0.24, 28]} … />`).
- Una zona: entre 3 y 8 unidades de lado. Edificios de 3 a 9 de alto.
- Detalles (ruedas, botones, bolsas): 0,2–1,5.
- Deja huecos de 2–3 unidades entre zonas: ahí van caminos, árboles o bandas que las unen.

## Lo que pide cada zona en `index.tsx`
- `zona: { centro, tam }` → la caja invisible que recibe el clic. Que cubra toda la zona, un poco más grande.
- `ancla` → el punto del que sale la línea de la tarjeta, encima de la zona (en lo alto de la máquina principal).
- `tecla` → "1" a "9", en el orden del recorrido.
- `encuadre` del mundo → el centro del plano general (más o menos el centro de la losa, algo elevado).
- `escala` (opcional) → tamaño del plano general. Si lo alto de la maqueta queda cortado o debajo del aviso de controles, bájala a 0.9 y sube la `y` de `encuadre` (cada unidad baja la escena).
- `arranque` → segundo del mundo con el que se abre. Si las piezas usan `<Entra en={…}>` para caer al principio, pon un valor mayor que el último `en` para que todo esté ya montado.

## Movimiento
- `useT()` da el segundo del mundo. Úsalo para todo lo que se mueve: `rotation={[0, t * 1.2, 0]}`, `frac(t / 6)` para ciclos.
- Para recorridos con pausas (una banda que avanza y para), calcula la posición con `frac`, `limite` y `suave` en función de `t`.
- Muchos objetos iguales (cajas en una banda, personas, partículas) → `instancedMesh` y matrices calculadas en un `useLayoutEffect` que depende de `t`. Mira `Banda` y `Corriente` en `src/piezas/`.

## Comprobación rápida
Abre el tablero y pulsa cada tecla: la cámara tiene que llegar a cada zona y la tarjeta apuntar a su máquina. Si una tarjeta apunta al aire, corrige su `ancla`.
