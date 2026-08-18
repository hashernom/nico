// Las seis flores del jardín. Cada una es una sección.
//
// Tres siluetas × seis paletas: cada forma se repite dos veces con distinto
// color, así el jardín tiene variedad sin verse desordenado.
//
// `x` e `y` son porcentajes dentro del cantero. Están desalineados a propósito:
// una grilla perfecta parece una tabla, no un jardín. En pantallas chicas el
// CSS los ignora y las flores pasan a un grid de dos columnas.

export const SECCIONES = [
    {
        id: 'tiempo',
        titulo: 'Tiempo',
        leyenda: 'Cuánto llevamos',
        icono: '⏳',
        silueta: 'margarita',
        paleta: 'rosa',
        x: 14,
        y: 26
    },
    {
        id: 'galeria',
        titulo: 'Galería',
        leyenda: 'Nuestras fotos',
        icono: '📷',
        silueta: 'rosita',
        paleta: 'celeste',
        x: 39,
        y: 12
    },
    {
        id: 'eventos',
        titulo: 'Eventos',
        leyenda: 'Los checkpoints',
        icono: '🚩',
        silueta: 'campanita',
        paleta: 'amarilla',
        x: 66,
        y: 24
    },
    {
        id: 'todos',
        titulo: 'To-Do',
        leyenda: 'Lo que falta hacer',
        icono: '✅',
        silueta: 'margarita',
        paleta: 'violeta',
        x: 88,
        y: 52
    },
    {
        id: 'cartas',
        titulo: 'Cartas',
        leyenda: 'Lo que nos escribimos',
        icono: '✉️',
        silueta: 'rosita',
        paleta: 'blanca',
        x: 57,
        y: 62
    },
    {
        id: 'musica',
        titulo: 'Música',
        leyenda: 'Canciones nuestras',
        icono: '🎵',
        silueta: 'campanita',
        paleta: 'verde',
        x: 24,
        y: 70
    }
];

export function seccionPorId(id) {
    return SECCIONES.find((s) => s.id === id) ?? null;
}
