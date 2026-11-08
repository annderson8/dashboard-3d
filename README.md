# tablero-3d

**Tu negocio como una maqueta 3D en la que haces clic en cada zona y ves sus números.** Los números salen de un CSV: lo editas, guardas y el tablero cambia solo. Si pones una zona en "parada", su máquina se detiene en el 3D.

Viene con un ejemplo completo: una tostadora de café, del camión que trae el café verde hasta el almacén.

![Tablero 3D de una tostadora de café con sus tarjetas y el registro de actividad](docs/captura-general.png)

## Pruébalo en dos minutos

Necesitas [Node.js](https://nodejs.org/) 20 o más reciente.

```bash
git clone https://github.com/USUARIO/tablero-3d.git
cd tablero-3d
npm install
npm run dev
```

Abre la dirección que imprime (normalmente `http://localhost:5173`). Luego:

- **Arrastra** para girar, **rueda** para acercar, **clic** en una zona para ver su panel. Teclas `1`–`6` para saltar entre zonas y `Esc` para volver.
- Abre `datos/planta.csv`, cambia `tostado_estado` a `parada` y guarda: la tostadora se detiene y el registro lo anota.

![Panel de la zona de tostado con su curva y la tostadora parada](docs/captura-parada.png)

## Haz el tuyo

### Con Claude Code (recomendado)

El repo trae una skill que te entrevista sobre tu negocio, elige contigo qué números mirar, escribe tu CSV y construye tu mundo con las piezas del kit.

```bash
npx skills add USUARIO/tablero-3d
```

Después, dentro de la carpeta del repo, pídele a Claude Code: *"haz el tablero 3D de mi negocio"*.

### A mano

1. Copia `src/mundos/tostadora/` a `src/mundos/<tu-negocio>/`.
2. Cambia zonas, indicadores y piezas en su `index.tsx` (el tipo `MundoTablero` en `src/mundos/tipos.ts` explica cada campo).
3. Pon tus datos en `datos/planta.csv` (formato en `skills/tablero-3d/referencias/csv.md`).
4. En `src/mundo.ts`, exporta tu mundo.

## El archivo de datos

```
clave,valor,unidad,nota
tostado_estado,en marcha,,en marcha | atención | parada
tostado_temperatura,203,°C,Temperatura del tambor
almacen_stock,1340,bolsas,"Huila, Colombia"
```

Una fila por dato. Las claves empiezan por su zona. Las series van con punto y coma (`200;121;98;117`). Las cifras del ejemplo son inventadas; la copia original está en `datos/ejemplos/tostadora.csv`.

## Cómo está hecho

| Carpeta | Qué hay |
| --- | --- |
| `src/piezas/` | Formas, partículas, colores y el reloj del mundo. Lo reutilizable |
| `src/tablero/` | Cámara, tarjetas flotantes, paneles, gráficas y lectura del CSV |
| `src/mundos/` | Cada negocio. `tostadora/` es el ejemplo |
| `skills/tablero-3d/` | La skill para Claude Code y sus referencias |
| `datos/` | El CSV que lee el tablero |

Hecho con [Three.js](https://threejs.org/) y [React Three Fiber](https://r3f.docs.pmnd.rs/), servido con [Vite](https://vite.dev/). Todo se dibuja con código, sin modelos 3D.

`npm run build` deja una versión estática en `dist/` (con una copia del CSV en ese momento; para datos en vivo usa `npm run dev`).

## Licencia

MIT. Úsalo, cámbialo y publícalo, también con fines comerciales, conservando el aviso de licencia.

Hecho por [Annder Rey](https://annderrey.com) · [@annderrey](https://instagram.com/annderrey). Cómo se pensó: [Cómo hacer un dashboard 3D de tu negocio con Claude y un CSV](https://annderrey.com/blog/dashboard-3d-con-claude-y-tus-datos).

---

### English

**tablero-3d** turns a business into a clickable isometric 3D model whose numbers come from a CSV file: edit it, save, and the dashboard updates; set a zone to `parada` (stopped) and its machine freezes. Includes a full coffee-roastery example and a Claude Code skill that interviews you about your business and builds your own world. `npm install && npm run dev` to try it. MIT licensed. The code and docs are in Spanish.
