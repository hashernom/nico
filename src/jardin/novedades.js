// ============================================================
//  NOVEDADES: avisar qué secciones tienen algo nuevo desde la última visita
//  Cada módulo de datos (galería, eventos, todos, cartas, música) reporta
//  la fecha del ítem más nuevo que cargó. Esto compara esa fecha contra la
//  última vez que la sección se abrió (guardada en localStorage) y prende
//  o apaga una insignia sobre la flor correspondiente.
// ============================================================

const PREFIJO = 'jardin-visto-';

const SECCIONES_CON_DATOS = ['galeria', 'eventos', 'todos', 'cartas', 'musica'];

// Si la sección está abierta en pantalla, lo que llegue por realtime no es
// "nuevo sin ver": la persona lo está viendo en el momento.
let seccionAbiertaId = null;

export function setSeccionAbierta(seccionId) {
    seccionAbiertaId = seccionId;
}

/**
 * Primera vez que este navegador ve el sistema de novedades: se marca todo
 * lo existente como "ya visto" para no prender las seis insignias de golpe
 * con contenido que Nico y Santi ya conocen de memoria. De acá en más,
 * "nuevo" es nuevo de verdad: agregado después de la última visita.
 */
export function inicializarPrimeraVez() {
    const yaConfigurado = SECCIONES_CON_DATOS.some((id) => localStorage.getItem(PREFIJO + id));
    if (yaConfigurado) return;

    const ahora = new Date().toISOString();
    SECCIONES_CON_DATOS.forEach((id) => localStorage.setItem(PREFIJO + id, ahora));
}

/** Se llama al abrir una sección: apaga su insignia y resetea el reloj. */
export function marcarVisto(seccionId) {
    localStorage.setItem(PREFIJO + seccionId, new Date().toISOString());
    pintarInsignia(seccionId, false);
}

/**
 * Se llama cada vez que un módulo de datos termina de cargar (o le llega
 * una actualización por realtime). `fechaMasReciente` es el created_at más
 * nuevo entre sus filas, o null si la tabla está vacía.
 */
export function avisarSiHayNovedad(seccionId, fechaMasReciente) {
    if (seccionId === seccionAbiertaId) {
        marcarVisto(seccionId);
        return;
    }

    if (!fechaMasReciente) {
        pintarInsignia(seccionId, false);
        return;
    }

    const ultimaVisita = localStorage.getItem(PREFIJO + seccionId);
    const hayAlgoNuevo = !ultimaVisita || new Date(fechaMasReciente) > new Date(ultimaVisita);
    pintarInsignia(seccionId, hayAlgoNuevo);
}

/** El created_at más nuevo de una lista de filas, o null si viene vacía. */
export function masReciente(filas) {
    if (!filas || filas.length === 0) return null;
    return filas.reduce(
        (max, fila) => (fila.created_at > max ? fila.created_at : max),
        filas[0].created_at
    );
}

function pintarInsignia(seccionId, visible) {
    const flor = document.querySelector(`.flor[data-seccion="${seccionId}"]`);
    if (!flor) return;

    flor.classList.toggle('flor--nueva', visible);

    // La insignia es puramente visual (aria-hidden): sin esto, alguien con
    // lector de pantalla no se entera de que hay algo nuevo.
    if (!flor.dataset.etiquetaBase) flor.dataset.etiquetaBase = flor.getAttribute('aria-label');
    flor.setAttribute(
        'aria-label',
        visible ? `${flor.dataset.etiquetaBase} · hay algo nuevo` : flor.dataset.etiquetaBase
    );
}
