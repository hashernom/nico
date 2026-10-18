// Los siete objetos mágicos del jardín. Cada uno es una sección.
//
// `x` e `y` son porcentajes dentro del cantero. Están desalineados a propósito:
// una grilla perfecta parece una tabla, no un patio. En pantallas chicas el
// CSS los ignora y los objetos pasan a un grid de dos columnas.
//
// `icono` es una clase de Font Awesome (ya cargado en la página).

export const SECCIONES = [
    { id: 'tiempo', titulo: 'Tiempo', leyenda: 'Cuánto llevamos', icono: 'fa-hourglass-half', objeto: 'reloj', x: 14, y: 26 },
    { id: 'galeria', titulo: 'Galería', leyenda: 'Nuestras fotos', icono: 'fa-image', objeto: 'retrato', x: 39, y: 12 },
    { id: 'eventos', titulo: 'Eventos', leyenda: 'Los checkpoints', icono: 'fa-map-location-dot', objeto: 'mapa', x: 66, y: 24 },
    { id: 'todos', titulo: 'To-Do', leyenda: 'Lo que falta hacer', icono: 'fa-wand-magic-sparkles', objeto: 'varita', x: 88, y: 52 },
    { id: 'cartas', titulo: 'Cartas', leyenda: 'Lo que nos escribimos', icono: 'fa-envelope', objeto: 'sobre', x: 57, y: 62 },
    { id: 'musica', titulo: 'Música', leyenda: 'Canciones nuestras', icono: 'fa-music', objeto: 'libro', x: 24, y: 70 },
    { id: 'sombrero', titulo: 'Sombrero', leyenda: '¿A qué casa pertenecemos?', icono: 'fa-hat-wizard', objeto: 'sombrero', x: 41, y: 91 }
];

export function seccionPorId(id) {
    return SECCIONES.find((s) => s.id === id) ?? null;
}

/** El ícono de una sección como HTML, para usar con innerHTML. */
export function iconoHTML(seccion) {
    return `<i class="fas ${seccion.icono}" aria-hidden="true"></i>`;
}
