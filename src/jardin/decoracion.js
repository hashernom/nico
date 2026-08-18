// ============================================================
//  DECORACIÓN DEL SUELO
//  El cantero solo tenía las 6 flores interactivas: mucho pasto plano
//  alrededor. Esto sparcea flores chiquitas (mismo generador de sprite.js,
//  a menor escala), matas de pasto, piedras y arbustos en el horizonte.
//  Todo puramente decorativo: pointer-events:none y detrás de las flores
//  reales en el z-index, para que nunca compita con el click.
//
//  Mobile tiene su PROPIO juego de puntos, no el mismo reescalado: en el
//  grid de 2 columnas las 6 flores reales no tienen coordenadas libres
//  (dependen del contenido, se resuelven en layout) y el cantero puede
//  scrollear, así que cualquier posición calculada a mano puede terminar
//  pisando una flor o desincronizada al hacer scroll. Lo seguro es limitar
//  la decoración de mobile a los pasillos que el grid deja SIEMPRE libres
//  sea cual sea el contenido: los bordes izquierdo/derecho y el pasillo
//  central entre las dos columnas.
// ============================================================

import { crearFlorSVG, SILUETAS, PALETAS } from './sprite.js';
import { SECCIONES } from './secciones.js';

const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const SILUETA_KEYS = Object.keys(SILUETAS);
const PALETA_KEYS = Object.keys(PALETAS);

export function setupDecoracion() {
    const cantero = document.querySelector('.cantero');
    const pasto = document.querySelector('.pasto');
    if (!cantero) return;

    cantero.prepend(crearSuelo('decor-suelo', puntosLibresDesktop(22, 8)));
    cantero.prepend(crearSuelo('decor-suelo-movil', puntosLibresMovil(16)));

    // Los arbustos van dentro de .pasto, no de .colinas: .pasto es hermano
    // posterior sin z-index propio y tapa el borde inferior de .colinas por
    // completo (así se ve la profundidad pasto-por-encima-de-colina). Un
    // arbusto anclado al fondo de .colinas quedaba enterrado ahí abajo,
    // invisible. Ubicado en .pasto y asomando hacia arriba con top negativo,
    // aparece justo en la línea del horizonte.
    if (pasto) {
        crearArbustos(pasto);
        crearMariposas(pasto);
    }
}

function crearSuelo(clase, puntos) {
    const suelo = document.createElement('div');
    suelo.className = clase;
    suelo.setAttribute('aria-hidden', 'true');

    // El mazo de elementos se mezcla una vez por jardín: así dos cargas de
    // página no muestran siempre "piedra, flor, mata" en el mismo orden,
    // y colores/formas vecinos no se repiten seguido.
    const mazo = mezclar(construirMazo(puntos.length));

    puntos.forEach((punto, indice) => {
        suelo.appendChild(crearElementoSuelo(mazo[indice], punto, indice));
    });

    return suelo;
    // Nota: cantero.prepend(suelo) lo hace el llamador. Va primero en el DOM
    // (detrás de las flores reales) y sin z-index propio: alcanza con que
    // las flores tengan el suyo (jardin.js les pone uno explícito a todas)
    // para quedar siempre por encima.
}

// --- El mazo: qué tipo de elemento va en cada punto -----------------------
// La mitad son flores chiquitas, el resto se reparte entre piedra y mata.
// Se arma como lista fija y se mezcla, en vez de decidir por índice/módulo:
// por módulo el patrón se repite cada N puntos y se nota.

function construirMazo(cantidad) {
    const mazo = [];
    for (let i = 0; i < cantidad; i++) {
        if (i % 2 === 0) mazo.push('flor');
        else if (i % 3 === 0) mazo.push('piedra');
        else mazo.push('mata');
    }
    return mazo;
}

function mezclar(lista) {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

// --- Ubicación: escritorio -------------------------------------------------
// Rechazo de puntos cerca de una flor real (posiciones de secciones.js) o
// de otro punto ya puesto, para que no se amontonen.

function puntosLibresDesktop(cantidad, separacionMinima) {
    const ocupados = SECCIONES.map((s) => [s.x, s.y]);
    const puntos = [];
    let intentos = 0;

    while (puntos.length < cantidad && intentos < cantidad * 40) {
        intentos++;
        const x = 3 + Math.random() * 94;
        const y = 6 + Math.random() * 90;

        const chocaConFlor = ocupados.some(([fx, fy]) => distancia(x, y, fx, fy) < 15);
        const chocaConOtro = puntos.some(([px, py]) => distancia(x, y, px, py) < separacionMinima);
        if (chocaConFlor || chocaConOtro) continue;

        puntos.push([x, y]);
    }

    return puntos;
}

// --- Ubicación: mobile ------------------------------------------------------
// Nada de evitar flores por coordenada: en el grid de 2 columnas se resuelven
// en layout, no hay un (x,y) fijo que revisar. En cambio, se usan franjas
// que el grid deja libres SIEMPRE, pase lo que pase con el contenido: los
// bordes y el pasillo entre columnas.

const FRANJAS_MOVIL = [
    { xMin: 2, xMax: 8 }, // borde izquierdo
    { xMin: 45, xMax: 55 }, // pasillo entre columnas
    { xMin: 92, xMax: 98 } // borde derecho
];

function puntosLibresMovil(cantidad) {
    const puntos = [];
    let intentos = 0;

    while (puntos.length < cantidad && intentos < cantidad * 40) {
        intentos++;
        const franja = FRANJAS_MOVIL[Math.floor(Math.random() * FRANJAS_MOVIL.length)];
        const x = franja.xMin + Math.random() * (franja.xMax - franja.xMin);
        const y = 4 + Math.random() * 92;

        const chocaConOtro = puntos.some(
            ([px, py]) => Math.abs(px - x) < 4 && Math.abs(py - y) < 6.5
        );
        if (chocaConOtro) continue;

        puntos.push([x, y]);
    }

    return puntos;
}

function distancia(x1, y1, x2, y2) {
    // Aproximado: el cantero no es cuadrado, pero alcanza para evitar
    // amontonamientos sin complicar la cuenta con el aspect ratio real.
    return Math.hypot(x1 - x2, y1 - y2);
}

// --- Elementos del suelo -------------------------------------------------
// Flores chiquitas: mismo generador que las 6 principales, pero con una
// paleta extra ('roja') que ninguna de las 6 secciones usa — esas ya están
// decididas, esto es solo para variedad en el suelo.
//
// Piedras: cuatro siluetas dibujadas a mano en CSS (redonda, angular,
// plana, en par) × cuatro tonos de gris/tierra, para que el suelo no se
// vea como el mismo guijarro clonado.

const FORMAS_PIEDRA = ['a', 'b', 'c', 'd'];
const TONOS_PIEDRA = ['#9B9488', '#8B9598', '#A98F73', '#7E8B7A'];

let cursorFlor = 0;
// Rojo y violeta pedidos explícitamente por el usuario: van una vez en la
// lista base (como cualquier otro color) y una segunda vez en el refuerzo,
// así que en promedio aparecen el doble de seguido que celeste/amarilla/etc.
const combosBase = SILUETA_KEYS.flatMap((silueta) => PALETA_KEYS.map((paleta) => ({ silueta, paleta })));
const combosRefuerzo = SILUETA_KEYS.flatMap((silueta) =>
    ['roja', 'violeta'].map((paleta) => ({ silueta, paleta }))
);
const COMBOS_FLOR = mezclar([...combosBase, ...combosRefuerzo]);

let cursorPiedra = 0;
const COMBOS_PIEDRA = mezclar(
    FORMAS_PIEDRA.flatMap((forma) => TONOS_PIEDRA.map((tono) => ({ forma, tono })))
);

function crearElementoSuelo(tipo, [x, y], indice) {
    const el = document.createElement('div');
    el.style.setProperty('--x', `${x}%`);
    el.style.setProperty('--y', `${y}%`);
    // Las de más abajo (más "cerca" de cámara) un poco más grandes, mismo
    // truco de profundidad que usan las flores principales.
    const escala = (0.7 + (y / 100) * 0.6).toFixed(2);
    el.style.setProperty('--escala', escala);

    if (tipo === 'flor') {
        el.className = 'decor-flor';
        const { silueta, paleta } = COMBOS_FLOR[cursorFlor % COMBOS_FLOR.length];
        cursorFlor++;
        el.appendChild(crearFlorSVG({ silueta, paleta }));
        return el;
    }

    if (tipo === 'piedra') {
        const { forma, tono } = COMBOS_PIEDRA[cursorPiedra % COMBOS_PIEDRA.length];
        cursorPiedra++;
        el.className = `decor-piedra decor-piedra--${forma}`;
        el.style.setProperty('--tono', tono);
        el.style.setProperty('--giro', `${Math.round(Math.random() * 40 - 20)}deg`);
        return el;
    }

    el.className = 'decor-mata';
    el.style.setProperty('--giro', `${Math.round(Math.random() * 16 - 8)}deg`);
    return el;
}

// --- Arbustos en el horizonte ---------------------------------------------

function crearArbustos(pasto) {
    const contenedor = document.createElement('div');
    contenedor.className = 'decor-arbustos';
    contenedor.setAttribute('aria-hidden', 'true');

    const posiciones = [6, 21, 38, 58, 74, 90];
    posiciones.forEach((x, indice) => {
        const arbusto = document.createElement('div');
        arbusto.className = 'decor-arbusto';
        arbusto.style.setProperty('--x', `${x}%`);
        arbusto.style.setProperty('--ancho', `${22 + (indice % 3) * 8}px`);
        contenedor.appendChild(arbusto);
    });

    pasto.appendChild(contenedor);
}

// --- Mariposas de día -----------------------------------------------------
// La contraparte de las luciérnagas nocturnas: revolotean solo con luz de
// día. Conviven todo el tiempo en el DOM, el CSS decide cuál se ve.

const COLORES_ALA = ['#FFB7C5', '#A8D8EA', '#FFD45E', '#C4A2E6'];

function crearMariposas(pasto) {
    if (sinMovimiento) return;

    const contenedor = document.createElement('div');
    contenedor.className = 'jardin-mariposas';
    contenedor.setAttribute('aria-hidden', 'true');

    for (let i = 0; i < 6; i++) {
        const mariposa = document.createElement('div');
        mariposa.className = 'jardin-mariposa';
        mariposa.style.left = `${8 + Math.random() * 84}%`;
        mariposa.style.top = `${10 + Math.random() * 70}%`;
        mariposa.style.setProperty('--color-ala', COLORES_ALA[i % COLORES_ALA.length]);
        mariposa.style.setProperty('--fly-duration', `${9 + Math.random() * 7}s`);
        mariposa.style.setProperty('--fly-delay', `${Math.random() * 8}s`);
        mariposa.style.setProperty('--fly-x1', `${40 + Math.random() * 40}px`);
        mariposa.style.setProperty('--fly-y1', `${-40 - Math.random() * 30}px`);
        mariposa.style.setProperty('--fly-x2', `${-10 + Math.random() * 30}px`);
        mariposa.style.setProperty('--fly-y2', `${-70 - Math.random() * 30}px`);
        mariposa.style.setProperty('--fly-x3', `${-50 - Math.random() * 30}px`);
        mariposa.style.setProperty('--fly-y3', `${-20 - Math.random() * 30}px`);
        contenedor.appendChild(mariposa);
    }

    pasto.appendChild(contenedor);
}
