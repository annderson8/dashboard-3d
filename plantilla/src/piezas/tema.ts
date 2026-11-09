// Colores y tipografías del tablero. Cámbialos aquí y cambia todo.
// La paleta de ejemplo es la de @annderrey: grises, un grafito y un solo acento verde.
export const color = {
  grafito: "#1C1E22",
  niebla: "#F1F2F4",
  piedra: "#5F636B",
  esmeralda: "#176B53", // acento sobre fondo claro
  esmeraldaClaro: "#35B893", // acento sobre fondo oscuro
  blanco: "#FFFFFF",
  borde: "#D5D7DB",
  metaOscuro: "#A3A7AE",
  divisorOscuro: "#3A3D44",
  textoSobreEsmeralda: "#CFE8DF",
} as const;

// Se cargan en index.html (Google Fonts).
export const fuente = {
  titulos: "'Bricolage Grotesque', system-ui, sans-serif",
  cuerpo: "'Newsreader', Georgia, serif",
  datos: "'IBM Plex Mono', ui-monospace, monospace",
};
