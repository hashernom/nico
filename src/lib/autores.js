// Mapea el uuid de created_by a un nombre. Son solo dos cuentas posibles
// (el registro público está cerrado), así que un mapa fijo alcanza: no
// hace falta una tabla de perfiles ni tocar el esquema para esto.
//
// El contenido migrado antes de la Fase 1 (las 27 fotos y 13 eventos
// históricos) tiene created_by null a propósito: no hay de quién tirar,
// así que esos ítems no muestran etiqueta.
// Exportado también para el widget de visitas, que arma una barra por
// persona conocida. Es el mismo mapa, una sola fuente de verdad.
export const NOMBRES = {
    'fd0f3964-19c5-4092-89c2-5ab1a4de5330': 'Santi',
    '4f5227e5-d156-486a-be0e-97fe2e3e416b': 'Nico'
};

export function nombreAutor(uuid) {
    return NOMBRES[uuid] ?? null;
}

/**
 * El chip "Nico"/"Santi" listo para insertar. Si no hay autor conocido
 * (contenido migrado, created_by null) devuelve un nodo de texto vacío:
 * siempre es seguro hacer `contenedor.appendChild(etiquetaAutor(x))` sin
 * chequear antes.
 */
export function etiquetaAutor(uuid) {
    const nombre = nombreAutor(uuid);
    if (!nombre) return document.createTextNode('');

    const chip = document.createElement('span');
    chip.className = `autor-tag autor-tag--${nombre.toLowerCase()}`;
    chip.textContent = nombre;
    return chip;
}
