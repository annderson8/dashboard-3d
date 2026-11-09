# Marca: colores, tipografías y logo

Toda la apariencia sale de `marca.json`, en la raíz del proyecto. No edites `src/piezas/tema.ts`, ni pongas colores sueltos en las piezas: usa `PAL`.

| Campo | Qué va |
| --- | --- |
| `acento` | El color exacto de la marca (`#E4572E`), también si es claro. Se usa tal cual en maqueta, gráficas y botones. Para el texto, el tablero calcula solo un tono legible |
| `fondo` | El fondo claro de la página. Solo se admiten fondos claros |
| `oscuro` | El color del texto y de las piezas oscuras. También tiñe los grises |
| `logo` | Ruta dentro de `public/` (`marca/logo.svg`), o vacío. Se ve junto al título |
| `titulos`, `cuerpo`, `datos` | Fuentes de Google Fonts: nombre y, si quieres, pesos (`Poppins:wght@700;800`). Pide solo pesos que la fuente tenga |

Si te pasan una web, un logo o un manual de marca, saca de ahí los colores y las fuentes. Si la fuente no está en Google Fonts, propón la más parecida y dilo.

## Cómo aplicarla
1. Cambia `marca.json`. Si hay logo, cópialo en `public/`. Con `npm run dev` en marcha, el tablero se actualiza solo.
2. `npm run validar`. Escribe en `acento` el color que te pidan, sin oscurecerlo tú.
3. Mira el resultado en el navegador y pregunta qué ajustar. Cambia solo lo que te pida.

## Criterio
- Un solo acento, usado con moderación. Si todo lleva el color de marca, ya no destaca lo importante.
- `atención` y `parada` se reconocen por su icono y su texto; no les asignes colores de marca.
- Las piezas que representan algo real pueden conservar su color (cartón, agua, madera).
