// ============================================================
//  SPRITES PIXEL ART: LOS SEIS OBJETOS MÁGICOS
//  Cada objeto se pinta en código sobre una grilla de 17×17 y se apoya
//  en un pedestal de piedra compartido (9 filas más). Nada de PNGs ni
//  sprite sheets: cada píxel es un <rect> del SVG, así la aparición se
//  puede animar píxel por píxel y pesa nada.
//
//  El contorno oscuro se deriva de la grilla (donde una celda toca el
//  vacío), igual que antes con las flores: los pintores solo eligen
//  colores de relleno y brillos.
// ============================================================

import { crearLienzo, BORDE } from './lienzo.js';
import { OBJETO_SOMBRERO } from './criaturas.js';

const ANCHO = 17;          // impar: existe un píxel central exacto
const ALTO_OBJETO = 17;
const LARGO_PEDESTAL = 9;
const ALTO = ALTO_OBJETO + LARGO_PEDESTAL;

const CENTRO_X = (ANCHO - 1) / 2;            // 8
const CENTRO_Y = (ALTO_OBJETO - 1) / 2;      // 8

// Piezas que no llevan contorno: chispas, estrellas, luces. Con contorno
// se leerían como manchas oscuras en vez de como brillo.
const SIN_BORDE = new Set(['chispa', 'chispaClara', 'estrella', 'luna', 'lunaSombra']);

// --- Lienzo ------------------------------------------------------------

const lienzo = () => crearLienzo(ANCHO, ALTO);

// --- Pedestal compartido ------------------------------------------------
// Una losa sobre un cuello y un pie ancho, con musgo en la base: los seis
// objetos se leen como piezas de museo en un mismo jardín de piedra.

const PIEDRA = {
    piedraClara: '#A9AFC8',
    piedra: '#7B819F',
    piedraOscura: '#505673',
    musgo: '#4F8F5A',
    musgoOscuro: '#2F6B42'
};

function pintarPedestal(g) {
    const y0 = ALTO_OBJETO;
    g.rect(3, y0, 11, 2, 'piedra');
    g.rect(5, y0 + 2, 7, 4, 'piedra');
    g.rect(2, y0 + 6, 13, 3, 'piedra');

    // Luz arriba a la izquierda, sombra abajo a la derecha.
    g.rect(3, y0, 11, 1, 'piedraClara');
    g.rect(5, y0 + 2, 1, 4, 'piedraClara');
    g.rect(2, y0 + 6, 13, 1, 'piedraClara');
    g.rect(13, y0 + 1, 1, 1, 'piedraOscura');
    g.rect(10, y0 + 2, 2, 4, 'piedraOscura');
    g.rect(12, y0 + 7, 3, 2, 'piedraOscura');

    // Musgo trepando por el pie.
    g.px(3, y0 + 6, 'musgo');
    g.px(4, y0 + 6, 'musgo');
    g.px(4, y0 + 7, 'musgoOscuro');
    g.px(8, y0 + 6, 'musgo');
    g.px(9, y0 + 6, 'musgoOscuro');
    g.px(13, y0 + 6, 'musgo');
}

// --- Los seis objetos ----------------------------------------------------

export const OBJETOS = {
    // Tiempo: reloj de arena de marco dorado.
    reloj: {
        paleta: {
            oroClaro: '#FFE59A', oro: '#E3AB3A', oroOscuro: '#9A6A1C',
            vidrio: '#D9F1FF', vidrioSombra: '#9CC7E6',
            arena: '#F7CE6E', arenaClara: '#FFE9A8'
        },
        pintar(g) {
            // Postes y tapas.
            g.rect(3, 3, 1, 11, 'oroOscuro');
            g.rect(13, 3, 1, 11, 'oroOscuro');
            g.rect(2, 0, 13, 3, 'oro');
            g.rect(2, 0, 13, 1, 'oroClaro');
            g.rect(2, 2, 13, 1, 'oroOscuro');
            g.rect(2, 14, 13, 3, 'oro');
            g.rect(2, 14, 13, 1, 'oroClaro');
            g.rect(2, 16, 13, 1, 'oroOscuro');

            // Vidrio: dos conos unidos por un cuello.
            for (let y = 3; y <= 13; y++) {
                const mitad = Math.min(4, Math.abs(y - 8));
                for (let x = CENTRO_X - mitad; x <= CENTRO_X + mitad; x++) {
                    g.px(x, y, x === CENTRO_X - mitad ? 'vidrio' : 'vidrioSombra');
                }
                // El brillo del vidrio cae del lado izquierdo.
                g.px(CENTRO_X - mitad, y, 'vidrio');
            }

            // Arena: un montoncito arriba, un hilo en el cuello y el montón abajo.
            for (let y = 6; y <= 7; y++) {
                const mitad = Math.abs(y - 8) - 1;
                for (let x = CENTRO_X - mitad; x <= CENTRO_X + mitad; x++) g.px(x, y, 'arena');
            }
            g.rect(CENTRO_X, 8, 1, 3, 'arenaClara');
            for (let y = 11; y <= 13; y++) {
                const mitad = Math.min(4, Math.abs(y - 8));
                for (let x = CENTRO_X - mitad; x <= CENTRO_X + mitad; x++) {
                    g.px(x, y, y === 11 ? 'arenaClara' : 'arena');
                }
            }
        }
    },

    // Galería: retrato enmarcado en oro, con luna.
    retrato: {
        paleta: {
            marcoClaro: '#FFE59A', marco: '#E3AB3A', marcoOscuro: '#9A6A1C',
            noche: '#1E2A55', nocheClara: '#33427A', luna: '#FFF1BE', estrella: '#FFF6D0',
            pelo: '#3A2316', piel: '#F0C7A0', pielSombra: '#D39C77',
            tunica: '#8A1E2D'
        },
        pintar(g) {
            g.rect(1, 0, 15, 17, 'marco');
            g.rect(2, 1, 13, 15, 'marcoClaro');
            g.rect(3, 2, 11, 13, 'marcoOscuro');
            g.rect(4, 3, 9, 11, 'noche');
            g.rect(4, 3, 9, 3, 'nocheClara');

            g.rect(11, 4, 2, 2, 'luna');
            g.px(5, 4, 'estrella');
            g.px(7, 6, 'estrella');

            g.disco(8, 8.5, 3, 'pelo');
            g.disco(8, 9, 2, 'piel');
            g.px(9, 10, 'pielSombra');
            g.px(7, 9, 'pelo');
            g.px(9, 9, 'pelo');
            g.rect(8, 11, 1, 1, 'pielSombra');
            g.rect(5, 12, 7, 2, 'tunica');
            g.px(8, 12, 'marco');
        }
    },

    // Eventos: el mapa del merodeador, con huellas de tinta.
    mapa: {
        paleta: {
            papelClaro: '#F6E7BE', papel: '#E6CF98', papelOscuro: '#C7A765',
            pliegue: '#B08F4F', tinta: '#3B2616', lacre: '#8A1E2D'
        },
        pintar(g) {
            g.rect(1, 1, 15, 15, 'papel');
            g.rect(1, 1, 15, 1, 'papelClaro');
            g.rect(1, 14, 15, 2, 'papelOscuro');
            g.rect(6, 2, 1, 13, 'pliegue');
            g.rect(11, 2, 1, 13, 'pliegue');

            // Huellas: pares de marcas que zigzaguean hacia la esquina.
            const huellas = [
                [3, 12], [4, 13], [4, 10], [5, 11], [7, 9], [8, 10],
                [8, 7], [9, 8], [10, 5], [11, 6], [13, 4], [14, 5]
            ];
            huellas.forEach(([x, y]) => g.px(x, y, 'tinta'));

            // La esquina doblada.
            g.rect(13, 14, 3, 2, 'papelOscuro');
            g.px(15, 14, 'pliegue');
            g.px(3, 4, 'lacre');
        }
    },

    // To-Do: una varita que chisporrotea.
    varita: {
        paleta: {
            mango: '#4A2C17', mangoClaro: '#7A4C28',
            vara: '#B98A57', varaClara: '#E1B988',
            chispa: '#FFE27A', chispaClara: '#FFFFFF'
        },
        pintar(g) {
            g.linea(2, 14, 11, 5, 'vara', 3);
            g.linea(3, 13, 11, 5, 'varaClara', 1);
            g.linea(2, 14, 5, 11, 'mango', 3);
            g.px(3, 13, 'mangoClaro');

            // La punta: una estrella de cuatro puntas y unas chispas sueltas.
            g.px(13, 3, 'chispaClara');
            g.px(12, 3, 'chispa');
            g.px(14, 3, 'chispa');
            g.px(13, 2, 'chispa');
            g.px(13, 4, 'chispa');
            g.px(15, 0, 'chispa');
            g.px(10, 1, 'chispa');
            g.px(15, 7, 'chispa');
            g.px(9, 4, 'chispaClara');
            g.px(15, 5, 'chispaClara');
        }
    },

    // Cartas: un sobre cerrado con lacre.
    sobre: {
        paleta: {
            papelClaro: '#FBF0D0', papel: '#EBD9A8', papelOscuro: '#C9AE72',
            solapa: '#DCC48C', pliegue: '#A98B4E',
            lacreClaro: '#D8566A', lacre: '#9C1F34', lacreOscuro: '#5F0F1E'
        },
        pintar(g) {
            g.rect(1, 3, 15, 12, 'papel');
            g.rect(1, 3, 15, 1, 'papelClaro');
            g.rect(1, 13, 15, 2, 'papelOscuro');

            // Solapa: un triángulo que baja hasta el centro.
            for (let t = 0; t <= 7; t++) {
                for (let x = 1 + t; x <= 15 - t; x++) g.px(x, 3 + t, 'solapa');
                g.px(1 + t, 3 + t, 'pliegue');
                g.px(15 - t, 3 + t, 'pliegue');
            }

            // Lacre sobre la punta.
            g.disco(8, 10, 2.4, 'lacre');
            g.px(7, 9, 'lacreClaro');
            g.px(8, 9, 'lacreClaro');
            g.px(9, 11, 'lacreOscuro');
            g.px(8, 11, 'lacreOscuro');
        }
    },

    // Sombrero: el Sombrero Seleccionador, con su cara de dormido.
    sombrero: OBJETO_SOMBRERO,

    // Música: un libro de hechizos con una nota dorada en la tapa.
    libro: {
        paleta: {
            tapa: '#2F4F7A', tapaClara: '#46689A', lomo: '#1F3556',
            pagina: '#F0E2B6', paginaSombra: '#CBB683',
            oro: '#F0C75A', oroOscuro: '#B8872A'
        },
        pintar(g) {
            g.rect(2, 0, 12, 15, 'tapa');
            g.rect(2, 0, 12, 1, 'tapaClara');
            g.rect(14, 1, 2, 14, 'pagina');
            g.rect(3, 15, 11, 2, 'pagina');
            g.rect(14, 1, 1, 14, 'paginaSombra');
            g.rect(2, 0, 3, 15, 'lomo');
            g.rect(4, 1, 1, 13, 'tapaClara');

            // Marco dorado y la nota.
            g.rect(6, 2, 7, 1, 'oro');
            g.rect(6, 12, 7, 1, 'oro');
            g.disco(8, 9.5, 1.2, 'oro');
            g.rect(9, 4, 1, 6, 'oro');
            g.px(10, 4, 'oro');
            g.px(11, 5, 'oro');
            g.px(11, 6, 'oroOscuro');
        }
    }
};

// --- Decoración chica del suelo -----------------------------------------
// Setas y cristales: mismo generador, lienzo propio más chico.

const DECOR = {
    setaRoja: { cap: '#B3243A', capClaro: '#E0566A', puntos: '#FFF1D0', tallo: '#EEDFC0', tipo: 'seta' },
    setaAzul: { cap: '#3D66B8', capClaro: '#78A2F0', puntos: '#DDF0FF', tallo: '#DCE6F3', tipo: 'seta' },
    setaVioleta: { cap: '#7A48B8', capClaro: '#B47EF0', puntos: '#F1E2FF', tallo: '#E8DDF3', tipo: 'seta' },
    cristalAzul: { claro: '#CFE8FF', base: '#6FA5E8', oscuro: '#3A66B0', tipo: 'cristal' },
    cristalVioleta: { claro: '#EAD7FF', base: '#A57BE0', oscuro: '#6A3FA8', tipo: 'cristal' }
};

export const TIPOS_DECOR = Object.keys(DECOR);

export function decorSVG(tipo) {
    const d = DECOR[tipo] ?? DECOR.setaRoja;
    const w = 11;
    const h = 11;
    const celdas = new Array(w * h).fill(null);
    const px = (x, y, c) => { if (x >= 0 && y >= 0 && x < w && y < h) celdas[y * w + x] = c; };
    const rect = (x, y, rw, rh, c) => { for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) px(x + i, y + j, c); };

    if (d.tipo === 'seta') {
        rect(4, 6, 3, 5, d.tallo);
        rect(3, 3, 5, 1, d.cap);
        rect(2, 4, 7, 2, d.cap);
        rect(4, 2, 3, 1, d.cap);
        rect(1, 5, 9, 1, d.cap);
        rect(4, 2, 2, 1, d.capClaro);
        px(3, 4, d.puntos);
        px(6, 3, d.puntos);
        px(7, 5, d.puntos);
    } else {
        // Cristal: un rombo alargado con una cara iluminada.
        rect(5, 0, 1, 1, d.claro);
        rect(4, 1, 3, 2, d.base);
        rect(3, 3, 5, 4, d.base);
        rect(4, 7, 3, 2, d.base);
        rect(5, 9, 1, 2, d.oscuro);
        rect(4, 1, 1, 6, d.claro);
        rect(7, 4, 1, 3, d.oscuro);
    }

    // Contorno derivado de la grilla.
    const vacio = (x, y) => x < 0 || y < 0 || x >= w || y >= h || celdas[y * w + x] === null;
    const partes = [];
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const c = celdas[y * w + x];
            if (!c) continue;
            const borde = vacio(x - 1, y) || vacio(x + 1, y) || vacio(x, y - 1) || vacio(x, y + 1);
            partes.push(`<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${borde ? BORDE : c}"/>`);
        }
    }

    return (
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" ` +
        `class="flor-svg" shape-rendering="crispEdges" aria-hidden="true" focusable="false">` +
        `${partes.join('')}</svg>`
    );
}

export function decorDataURI(tipo) {
    return `data:image/svg+xml,${encodeURIComponent(decorSVG(tipo))}`;
}

export function crearDecorIMG(tipo) {
    const img = document.createElement('img');
    img.className = 'flor-svg';
    img.src = decorDataURI(tipo);
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    return img;
}

// --- Construcción y sombreado -------------------------------------------

function construirGrilla(objeto) {
    const g = lienzo();
    objeto.pintar(g);
    pintarPedestal(g);

    // Contorno: toda celda que toca el vacío pasa a ser borde, salvo los brillos.
    const vacio = (x, y) =>
        x < 0 || y < 0 || x >= ANCHO || y >= ALTO || g.celdas[y * ANCHO + x] === null;
    const final = g.celdas.slice();
    for (let y = 0; y < ALTO; y++) {
        for (let x = 0; x < ANCHO; x++) {
            const clave = g.celdas[y * ANCHO + x];
            if (!clave || SIN_BORDE.has(clave)) continue;
            if (vacio(x - 1, y) || vacio(x + 1, y) || vacio(x, y - 1) || vacio(x, y + 1)) {
                final[y * ANCHO + x] = 'borde';
            }
        }
    }
    return final;
}

// --- Orden de aparición --------------------------------------------------
// Primero sube el pedestal, después el objeto se materializa desde el centro.

function ordenDe(x, y) {
    if (y >= ALTO_OBJETO) return ALTO - y;
    return LARGO_PEDESTAL + Math.round(Math.hypot(x - CENTRO_X, y - CENTRO_Y));
}

// --- API pública -----------------------------------------------------------

/**
 * Devuelve el SVG de un objeto como texto.
 * Se arma como string y no con createElementNS para que ande también fuera
 * del navegador: así se puede rasterizar desde un script de Node.
 *
 * @param {object} opciones
 * @param {string} opciones.objeto   clave de OBJETOS
 * @param {boolean} opciones.pedestal si false, recorta el SVG al objeto
 * @param {number} opciones.pasoMs   milisegundos entre "anillos" de aparición
 * @param {boolean} opciones.animado si false, omite los --px-delay: el sprite
 *        va a usarse como imagen plana (ver objetoDataURI), donde esos
 *        atributos no sirven de nada.
 */
export function objetoSVG({ objeto = 'reloj', pedestal = true, pasoMs = 55, animado = true } = {}) {
    const def = OBJETOS[objeto] ?? OBJETOS.reloj;
    const colores = { ...PIEDRA, ...def.paleta, borde: BORDE };
    const celdas = construirGrilla(def);

    const alto = pedestal ? ALTO : ALTO_OBJETO;
    const partes = [];
    let maxOrden = 0;

    for (let y = 0; y < alto; y++) {
        for (let x = 0; x < ANCHO; x++) {
            const clave = celdas[y * ANCHO + x];
            if (!clave) continue;
            const color = colores[clave] ?? '#ff00ff';

            // 1.02 en vez de 1: mata las costuras de medio píxel al escalar.
            if (animado) {
                const orden = ordenDe(x, y);
                if (orden > maxOrden) maxOrden = orden;
                partes.push(
                    `<rect x="${x}" y="${y}" width="1.02" height="1.02" ` +
                    `fill="${color}" style="--px-delay:${orden * pasoMs}ms"/>`
                );
            } else {
                partes.push(`<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${color}"/>`);
            }
        }
    }

    const estilo = animado ? ` style="--px-total:${(maxOrden + 1) * pasoMs}ms"` : '';

    return (
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ANCHO} ${alto}" ` +
        `width="${ANCHO}" height="${alto}" ` +
        `class="flor-svg" shape-rendering="crispEdges" aria-hidden="true" focusable="false"${estilo}>` +
        `${partes.join('')}</svg>`
    );
}

/** El mismo objeto como elemento listo para insertar: un <svg> con un
 * <rect> por píxel, para animar la aparición píxel por píxel. */
export function crearObjetoSVG(opciones) {
    const doc = new DOMParser().parseFromString(objetoSVG(opciones), 'image/svg+xml');
    return document.importNode(doc.documentElement, true);
}

/**
 * El mismo objeto ya aplastado a un solo nodo: un <img> con el SVG
 * incrustado como data-URI. Mismo pixel art (`image-rendering: pixelated`
 * lo mantiene nítido), sin un <rect> del DOM por píxel.
 */
export function objetoDataURI(opciones) {
    return `data:image/svg+xml,${encodeURIComponent(objetoSVG({ ...opciones, animado: false }))}`;
}

export function crearObjetoIMG(opciones) {
    const img = document.createElement('img');
    img.className = 'flor-svg';
    img.src = objetoDataURI(opciones);
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    return img;
}

/** Cuánto tarda un objeto en materializarse del todo, para encadenar la transición. */
export function duracionAparicion(pasoMs = 55) {
    return (LARGO_PEDESTAL + Math.ceil(Math.hypot(CENTRO_X, CENTRO_Y)) + 2) * pasoMs;
}

export const DIMENSIONES = { ancho: ANCHO, alto: ALTO, altoObjeto: ALTO_OBJETO };
