---
name: tablero-3d
description: Crea un tablero 3D interactivo de un negocio (una maqueta isométrica en la que haces clic en cada zona y ves sus números) que lee sus datos de un CSV y se actualiza al guardarlo. Úsala cuando alguien pida "un dashboard 3D", "mi negocio en 3D", "un tablero de mi empresa", "convierte mis datos en un mundo 3D" o quiera adaptar el tablero de ejemplo (la tostadora de café) a su negocio.
---

# Tablero 3D

Convierte un negocio en una maqueta 3D clicable conectada a un CSV. Trabaja dentro del repo `tablero-3d`:
el tablero (cámara, tarjetas, paneles, lectura del CSV) ya está hecho; tu trabajo es **el mundo**: las zonas,
sus números y sus piezas 3D. El ejemplo completo es `src/mundos/tostadora/`.

Antes de empezar, comprueba que estás en el repo (existe `src/mundo.ts`). Si no, pide clonarlo y haz `npm install`.

## 1. Entrevista: qué números mirar (no te la saltes)

Es el paso que decide si el tablero sirve, y no lo puedes inventar tú. Pregunta **de una en una**, con ejemplos para que respondan fácil:

1. Qué hace el negocio, en dos líneas.
2. Por qué zonas pasa el trabajo, de principio a fin (de 3 a 6 zonas). Ejemplo: recepción → tostado → empaque → almacén.
3. En cada zona, qué te dice que un día va bien o mal.
4. Qué harías al ver cambiar ese número. Si no harías nada, ese número no va.
5. Qué tiene que ver alguien de fuera en 5 segundos (los 3–5 indicadores de arriba).

Luego propón como máximo **un número principal por zona** y **cinco indicadores**, cada uno con la decisión que ayuda a tomar. Espera su visto bueno.
Criterio completo en `referencias/criterio.md`.

## 2. El archivo

1. Los ejemplos ya tienen copia en `datos/ejemplos/` (`tostadora.csv`, `tienda.csv`). Si `datos/planta.csv` tiene datos del usuario que no estén ahí, cópialos antes de sobrescribir.
2. Escribe en `datos/planta.csv` los datos del negocio con el formato de `referencias/csv.md`:
   columnas `clave,valor,unidad,nota`, claves con el prefijo de su zona (`reparto_pedidos_en_ruta`) y una fila `<zona>_estado` por zona.
3. Si no tienen números reales todavía, pon valores plausibles y dilo: "son de ejemplo, cámbialos por los tuyos".

## 3. El mundo

1. Crea `src/mundos/<negocio>/` copiando la estructura de un ejemplo: `src/mundos/tienda/` (servicios, comercio, logística; usa solo piezas del kit) o `src/mundos/tostadora/` (fabricación, con máquinas a medida):
   - `index.tsx` exporta un `MundoTablero` (tipo en `src/mundos/tipos.ts`): título, zonas, indicadores, historial, nombres y `Planta`.
   - Las piezas 3D de cada zona en archivos aparte (como `maquinas.tsx`).
2. Construye cada zona con las piezas de `src/piezas/` (catálogo en `referencias/piezas.md`): formas, bandas, partículas y las comunes (personas, árboles, furgonetas, cajas que circulan).
   Nada de modelos externos. Que cada zona **haga algo**: una banda que corre, una máquina que gira, un vehículo que llega.
3. Coloca las zonas siguiendo `referencias/mundo.md` (ejes, tamaños, cámara). Para cada zona define su caja de clic (`zona`) y el punto de su tarjeta (`ancla`).
4. Cambia `src/mundo.ts` para que exporte el mundo nuevo.

Reglas que evitan los fallos típicos:
- **Todo se mueve con `useT()`** (segundo del mundo), nunca con estado propio ni con `useFrame` dentro de una pieza. Así funcionan "parada" (congelar) y el arranque.
- **Envuelve cada zona en `<Congela desde={paradaDesde("<zona>")}>`** para que se detenga cuando su estado sea "parada".
- **Todo número en pantalla sale del CSV** (`d.num`, `d.valor`, `d.serie`, `d.filas`). Nada inventado en el código.
- **Una paleta corta** en `src/piezas/tema.ts` y un solo color de acento.

## 4. Comprobar

1. `npx tsc --noEmit` sin errores.
2. `npm run dev` y abre la dirección que imprime. Comprueba: se ve la maqueta entera, cada zona se resalta al pasar el puntero, el clic abre su panel y las tarjetas apuntan a su zona.
3. Abre el panel **Datos**, cambia una cifra y un `<zona>_estado` a `parada`: cambia la cifra al momento, la tarjeta marca PARADA, esa zona se congela y `datos/planta.csv` queda guardado. (Editar el archivo a mano tiene el mismo efecto en ~2 s.)
4. Busca claves usadas en el código que no estén en el CSV (`grep -o 'd\.\(num\|valor\|serie\|filas\)("[a-z_]*")' -r src/mundos/<negocio>`): cada una tiene que existir.

## 5. Entregar

Di qué zonas y qué números quedaron (y por qué), cómo arrancarlo (`npm run dev`), qué fila del CSV cambiar para probarlo y qué es dato de ejemplo.
