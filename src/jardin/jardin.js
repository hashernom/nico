// ============================================================
//  EL JARDÍN
//  Menú-jardín: seis flores repartidas sobre el pasto, cada una
//  una sección. Al tocar una, la cámara hace zoom hacia ella y el
//  panel de madera crece desde su centro.
//
//  Los pétalos son NAVEGACIÓN, no contenido: el contenido siempre
//  va en el panel. (Decisión tomada con el usuario; texto sobre
//  pétalos rotados es ilegible en un celular de 360px.)
// ============================================================

import { crearFlorSVG } from './sprite.js';
import { SECCIONES } from './secciones.js';

const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let elementos = null;
let florAbierta = null;   // el botón que abrió el panel, para devolverle el foco

export function setupJardin() {
    const cantero = document.getElementById('cantero');
    if (!cantero) return;

    elementos = {
        cantero,
        mundo: document.getElementById('mundo'),
        escena: document.getElementById('escena'),
        capa: document.getElementById('panelCapa'),
        panel: document.getElementById('panelMadera'),
        titulo: document.getElementById('panelTitulo'),
        icono: document.getElementById('panelIcono'),
        cerrar: document.getElementById('panelCerrar'),
        cuerpo: document.getElementById('panelCuerpo')
    };

    plantarFlores();
    conectarPanel();
}

// --- Plantar ----------------------------------------------------------

function plantarFlores() {
    const { cantero } = elementos;

    SECCIONES.forEach((seccion, indice) => {
        const flor = document.createElement('button');
        flor.type = 'button';
        flor.className = 'flor';
        flor.dataset.seccion = seccion.id;
        flor.style.setProperty('--x', `${seccion.x}%`);
        flor.style.setProperty('--y', `${seccion.y}%`);
        // Las de abajo están "más cerca": un poco más grandes y por delante.
        // Es lo que convierte una lista de flores en un plano con profundidad.
        flor.style.setProperty('--escala', (0.82 + (seccion.y / 100) * 0.4).toFixed(3));
        flor.style.zIndex = Math.round(seccion.y);
        // Escalonado: el jardín se abre flor por flor, no todo de golpe.
        flor.style.setProperty('--orden', indice);
        flor.setAttribute('aria-label', `${seccion.titulo}: ${seccion.leyenda}`);

        const sprite = document.createElement('span');
        sprite.className = 'flor-sprite';
        sprite.appendChild(crearFlorSVG({ silueta: seccion.silueta, paleta: seccion.paleta }));

        const cartel = document.createElement('span');
        cartel.className = 'flor-cartel';
        cartel.innerHTML =
            `<span class="flor-icono" aria-hidden="true">${seccion.icono}</span>` +
            `<span class="flor-nombre"></span>`;
        cartel.querySelector('.flor-nombre').textContent = seccion.titulo;

        flor.append(sprite, cartel);
        flor.addEventListener('click', () => abrirSeccion(seccion, flor));
        cantero.appendChild(flor);
    });
}

// --- Abrir y cerrar ---------------------------------------------------

function conectarPanel() {
    const { capa, cerrar } = elementos;

    cerrar.addEventListener('click', () => cerrarSeccion());

    capa.addEventListener('click', (e) => {
        if (e.target === capa) cerrarSeccion();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape' || !capa.classList.contains('visible')) return;

        // Si hay un lightbox de por medio, el Escape es suyo. Se miran las dos
        // cosas porque no está garantizado cuál de los dos handlers corre
        // primero: si el lightbox ya cerró, dejó la marca; si todavía no,
        // sigue abierto.
        if (e.tomadoPorLightbox) return;
        if (document.getElementById('lightboxOverlay')?.classList.contains('active')) return;

        cerrarSeccion();
    });

    // En el celular, el botón "atrás" tiene que volver al jardín en vez de
    // sacar a Nicole del sitio.
    window.addEventListener('popstate', () => {
        if (capa.classList.contains('visible')) cerrarSeccion({ volverAtras: false });
    });
}

function abrirSeccion(seccion, flor) {
    const { capa, panel, titulo, icono, cuerpo, mundo } = elementos;

    florAbierta = flor;

    titulo.textContent = seccion.titulo;
    icono.textContent = seccion.icono;
    panel.dataset.paleta = seccion.paleta;

    cuerpo.querySelectorAll('.seccion').forEach((s) => {
        s.hidden = s.dataset.seccion !== seccion.id;
    });
    cuerpo.scrollTop = 0;

    // La cámara se acerca a la flor tocada.
    enfocarCamara(flor);

    capa.classList.add('visible');
    document.body.classList.add('panel-abierto');

    // El panel crece desde el centro de la flor. offsetWidth/Height no se ven
    // afectados por el scale(0) inicial, así que sirven para ubicar el origen.
    const rectoFlor = flor.getBoundingClientRect();
    const rectoCapa = capa.getBoundingClientRect();
    const izquierda = rectoCapa.left + (rectoCapa.width - panel.offsetWidth) / 2;
    const arriba = rectoCapa.top + (rectoCapa.height - panel.offsetHeight) / 2;

    panel.style.transformOrigin =
        `${rectoFlor.left + rectoFlor.width / 2 - izquierda}px ` +
        `${rectoFlor.top + rectoFlor.height / 2 - arriba}px`;

    // Un reflow sincrónico para que el navegador registre la escala inicial
    // antes de la transición. Con requestAnimationFrame esto no ocurre en
    // pestañas en segundo plano y el panel se quedaba invisible para siempre
    // (el mismo bug que ya tuvo la animación de bienvenida en la Fase 1).
    void panel.offsetWidth;
    panel.classList.add('creciendo');

    history.pushState({ seccion: seccion.id }, '');
    elementos.cerrar.focus({ preventScroll: true });
    mundo?.setAttribute('aria-hidden', 'true');
}

function cerrarSeccion({ volverAtras = true } = {}) {
    const { capa, panel, mundo } = elementos;
    if (!capa.classList.contains('visible')) return;

    panel.classList.remove('creciendo');
    capa.classList.remove('visible');
    document.body.classList.remove('panel-abierto');
    mundo?.removeAttribute('aria-hidden');
    soltarCamara();

    if (volverAtras && history.state?.seccion) history.back();

    florAbierta?.focus({ preventScroll: true });
    florAbierta = null;
}

// --- Cámara -----------------------------------------------------------
// Zoom sobre la flor tocada. El origen se fija en el centro de esa flor,
// así el acercamiento sale desde ella y no desde el medio de la pantalla.

function enfocarCamara(flor) {
    const { mundo } = elementos;
    if (!mundo || sinMovimiento) return;

    const rectoFlor = flor.getBoundingClientRect();
    const rectoMundo = mundo.getBoundingClientRect();

    mundo.style.transformOrigin =
        `${rectoFlor.left + rectoFlor.width / 2 - rectoMundo.left}px ` +
        `${rectoFlor.top + rectoFlor.height / 2 - rectoMundo.top}px`;
    mundo.classList.add('enfocado');
}

function soltarCamara() {
    elementos.mundo?.classList.remove('enfocado');
}

/** Abre el jardín cuando termina la intro. */
export function mostrarJardin() {
    const { escena, cantero } = elementos ?? {};
    if (!escena) return;

    escena.removeAttribute('aria-hidden');
    escena.classList.add('visible');
    // La clase dispara la floración escalonada de las seis flores.
    cantero?.classList.add('floreciendo');
}
