# Formato de datos/planta.csv

Lo abre Excel, Numbers o Google Sheets (Archivo → Descargar → CSV). El tablero lo relee cada 1,5 s.

```
clave,valor,unidad,nota
tostado_estado,en marcha,,en marcha | atención | parada
tostado_temperatura,203,°C,Temperatura del tambor
tostado_curva,200;121;98;117;136;151,°C,Una lectura por minuto
almacen_stock,1340,bolsas,"Huila, Colombia"
almacen_stock,980,bolsas,"Cerrado, Brasil"
```

| Columna | Qué va |
| --- | --- |
| `clave` | En minúsculas con guiones bajos. Empieza por el `id` de su zona (`tostado_…`). Los indicadores generales pueden no llevar prefijo |
| `valor` | Número (punto o coma decimal), texto, o una serie separada por punto y coma |
| `unidad` | Para leerlo (°C, kg, bolsas/min). El tablero no la usa para calcular |
| `nota` | Explicación para quien edita el archivo. En claves repetidas, el nombre de cada fila (p. ej. el origen del stock) |

También acepta `;` como separador de columnas (el de Excel en español) si la cabecera lo usa: `clave;valor;unidad;nota`. El panel Datos guarda con el mismo separador que encontró.

## Lo que lee el código
- `d.num("clave")` → número (0 si no existe).
- `d.valor("clave")` → texto.
- `d.serie("clave")` → lista de números de una celda con `;`.
- `d.filas("clave")` → todas las filas de una clave repetida (con su `nota`).
- `d.estado("zona")` → "en marcha" | "atención" | "parada", leído de `<zona>_estado`.

## Estados automáticos
Una fila `<zona>_regla` hace que la zona cambie sola. Puede haber varias por zona; manda lo más grave.

```
recepcion_regla,recepcion_sin_cobrar_eur > 500 : atención,,Cobros
recepcion_regla,recepcion_sin_cobrar_eur > umbral_cobros_parada : parada,,Cobros graves
```

- Forma: `clave comparador valor : atención` o `: parada`. Comparadores: `>`, `>=`, `<`, `<=`, `=`.
- A la derecha va una cifra u otra clave del CSV, que sirve para que el umbral se edite como un dato más.
- El estado final es el más grave entre `<zona>_estado` y las reglas. En las zonas con reglas, deja `<zona>_estado` en `en marcha`, porque si no la zona nunca podrá volver sola.
- Las notas de las reglas de una misma zona tienen que ser distintas.

## Obligatorio
- Una fila `<zona>_estado` por cada zona del mundo.
- Toda clave que use el código existe en el archivo (`npm run validar` lo comprueba).
- Valores entre comillas si llevan comas (`"Huila, Colombia"`).
