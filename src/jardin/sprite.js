// ============================================================
//  SPRITES PIXEL ART DE FLORES
//  Una sola definición de grilla + paletas intercambiables.
//  Nada de PNGs ni sprite sheets: cada píxel es un <rect> del SVG,
//  así el florecer se puede animar píxel por píxel y pesa nada.
// ============================================================

const ANCHO = 17;          // impar: existe un píxel central exacto
const ALTO_CABEZA = 17;
const LARGO_TALLO = 9;
const ALTO = ALTO_CABEZA + LARGO_TALLO;

const CENTRO_X = (ANCHO - 1) / 2;            // 8
const CENTRO_Y = (ALTO_CABEZA - 1) / 2;      // 8

// --- Las tres siluetas -------------------------------------------------
// Hay dos maneras de definir la forma de una cabeza:
//
//   tipo 'rosa'   — curva rosa: r(θ) = radio · (panza + (1-panza)·|cos(pétalos·θ/2)|^punta)
//                   Da pétalos que nacen anchos y terminan en punta.
//   tipo 'discos' — un círculo por pétalo alrededor del centro.
//                   Da pétalos redondos y separados, que es como se dibujan
//                   las flores en el pixel art clásico.
//
// La curva sola no alcanzaba: por más que se ajusten los números, siempre
// termina en punta y la flor se lee como un destello, no como una flor.
export const SILUETAS = {
    // Ocho pétalos finitos y separados, tipo margarita.
    margarita: { tipo: 'rosa', petalos: 8, panza: 0.30, punta: 0.50, radio: 8.0, centro: 2.2, giro: 0 },
    // Cinco pétalos anchos, uno mirando hacia arriba.
    rosita: { tipo: 'rosa', petalos: 5, panza: 0.45, punta: 0.60, radio: 8.0, centro: 2.6, giro: 90 },
    // Seis pétalos redondos, bien separados.
    campanita: { tipo: 'discos', petalos: 6, distancia: 5.5, radioPetalo: 2.5, centro: 2.4, giro: -90 }
};

// --- Las seis paletas --------------------------------------------------
// Conviven con la paleta Stardew de base.css: nada acá desentona con la madera.
export const PALETAS = {
    rosa: {
        claro: '#FFD9E4', base: '#FFB7C5', oscuro: '#E8899C', borde: '#A9506A',
        centroClaro: '#FFE9A8', centroBase: '#F5C752', centroBorde: '#9C6B1E'
    },
    celeste: {
        claro: '#D6F0FA', base: '#A8D8EA', oscuro: '#6FB5D0', borde: '#3A6E8C',
        centroClaro: '#FFE9A8', centroBase: '#F5C752', centroBorde: '#9C6B1E'
    },
    amarilla: {
        claro: '#FFEFA8', base: '#FFD45E', oscuro: '#E5AC33', borde: '#96661A',
        centroClaro: '#E09A55', centroBase: '#B96A2E', centroBorde: '#6B3A12'
    },
    violeta: {
        claro: '#E7D4F7', base: '#C4A2E6', oscuro: '#9A72C4', borde: '#5E4187',
        centroClaro: '#FFE9A8', centroBase: '#F5C752', centroBorde: '#9C6B1E'
    },
    blanca: {
        claro: '#FFFFFF', base: '#FBF1E2', oscuro: '#DCC5A6', borde: '#94795C',
        centroClaro: '#FFE9A8', centroBase: '#F5C752', centroBorde: '#9C6B1E'
    },
    // Menta, no verde pasto: sobre el cantero un verde hoja desaparecería.
    verde: {
        claro: '#DEF9EC', base: '#A8E6CF', oscuro: '#6FBF9B', borde: '#2C6B52',
        centroClaro: '#FFE9A8', centroBase: '#F5C752', centroBorde: '#9C6B1E'
    },
    // No la usa ninguna de las 6 secciones (esas ya están decididas): es
    // para las flores chiquitas decorativas del suelo, que pedían más rojo.
    roja: {
        claro: '#FFC2C2', base: '#E8636B', oscuro: '#C23B47', borde: '#7A222B',
        centroClaro: '#FFE9A8', centroBase: '#F5C752', centroBorde: '#9C6B1E'
    }
};

// El tallo y las hojas son iguales en las seis: el jardín se lee como un jardín.
const VERDE = { claro: '#8FC957', base: '#6FA83A', oscuro: '#4C7827', borde: '#2C4715' };

// --- Construcción de la grilla ----------------------------------------

const VACIO = 0;
const PETALO = 1;
const CENTRO = 2;
const TALLO = 3;
const HOJA = 4;

function radioEn(angulo, silueta) {
    const { petalos, panza, punta, radio, giro } = silueta;
    const t = angulo + (giro * Math.PI) / 180;
    const lobulo = Math.abs(Math.cos((petalos * t) / 2)) ** punta;
    return radio * (panza + (1 - panza) * lobulo);
}

/** Los centros de los pétalos, para las siluetas de tipo 'discos'. */
function centrosDePetalos(silueta) {
    const centros = [];
    for (let i = 0; i < silueta.petalos; i++) {
        const t = (i / silueta.petalos) * Math.PI * 2 + (silueta.giro * Math.PI) / 180;
        centros.push([
            CENTRO_X + Math.cos(t) * silueta.distancia,
            CENTRO_Y + Math.sin(t) * silueta.distancia
        ]);
    }
    return centros;
}

/** Hasta dónde llega la cabeza en un ángulo dado. Sirve para sombrear. */
function extensionEn(angulo, silueta) {
    return silueta.tipo === 'discos'
        ? silueta.distancia + silueta.radioPetalo
        : radioEn(angulo, silueta);
}

function esPetalo(x, y, silueta, centros) {
    if (silueta.tipo === 'discos') {
        return centros.some(
            ([px, py]) => Math.hypot(x - px, y - py) <= silueta.radioPetalo
        );
    }
    const dx = x - CENTRO_X;
    const dy = y - CENTRO_Y;
    return Math.hypot(dx, dy) <= radioEn(Math.atan2(dy, dx), silueta);
}

// Hoja dibujada a mano: una gota de 5×3 es demasiado chica para que una
// fórmula quede prolija, y las hojas son lo primero que se ve mal.
const HOJA_OFFSETS = [
    [0, 0], [1, 0], [2, 0], [3, 0],
    [0, 1], [1, 1], [2, 1], [3, 1], [4, 1],
    [1, 2], [2, 2], [3, 2]
];

export function construirGrilla(silueta) {
    const celdas = new Uint8Array(ANCHO * ALTO); // VACIO por defecto
    const en = (x, y) => y * ANCHO + x;

    // Cabeza: pétalos + centro
    const centros = silueta.tipo === 'discos' ? centrosDePetalos(silueta) : null;

    for (let y = 0; y < ALTO_CABEZA; y++) {
        for (let x = 0; x < ANCHO; x++) {
            const dist = Math.hypot(x - CENTRO_X, y - CENTRO_Y);
            if (dist <= silueta.centro) {
                celdas[en(x, y)] = CENTRO;
            } else if (esPetalo(x, y, silueta, centros)) {
                celdas[en(x, y)] = PETALO;
            }
        }
    }

    // Tallo: sale desde abajo de la cabeza. Dentro de la cabeza solo ocupa
    // huecos, para no abrir un agujero verde en medio de un pétalo.
    for (let y = ALTO_CABEZA - 4; y < ALTO; y++) {
        for (const x of [CENTRO_X, CENTRO_X + 1]) {
            if (y >= ALTO_CABEZA || celdas[en(x, y)] === VACIO) {
                celdas[en(x, y)] = TALLO;
            }
        }
    }

    // Dos hojas, a distinta altura para que no quede simétrico ni rígido
    HOJA_OFFSETS.forEach(([dx, dy]) => {
        celdas[en(CENTRO_X - 1 - dx, ALTO_CABEZA + 2 + dy)] = HOJA;   // izquierda
        celdas[en(CENTRO_X + 2 + dx, ALTO_CABEZA + 5 + dy)] = HOJA;   // derecha
    });

    return celdas;
}

// --- Sombreado ---------------------------------------------------------
// El color de cada píxel se deriva de la grilla, no se dibuja a mano:
// borde donde toca el vacío, claro hacia la punta, oscuro hacia el centro.

function colorDe(celdas, x, y, silueta, paleta) {
    const tipo = celdas[y * ANCHO + x];
    if (tipo === VACIO) return null;

    const vecinoVacio =
        esVacio(celdas, x - 1, y) || esVacio(celdas, x + 1, y) ||
        esVacio(celdas, x, y - 1) || esVacio(celdas, x, y + 1);

    if (tipo === TALLO || tipo === HOJA) {
        if (vecinoVacio) return VERDE.borde;
        if (tipo === TALLO) return VERDE.base;
        // Las hojas se iluminan arriba a la izquierda: da volumen sin dibujar nada.
        return esVacio(celdas, x - 1, y - 1) ? VERDE.claro : VERDE.oscuro;
    }

    if (tipo === CENTRO) {
        if (tocaPetalo(celdas, x, y)) return paleta.centroBorde;
        const dx = x - CENTRO_X;
        const dy = y - CENTRO_Y;
        return dx + dy <= -1 ? paleta.centroClaro : paleta.centroBase;
    }

    // PETALO
    if (vecinoVacio) return paleta.borde;

    const dx = x - CENTRO_X;
    const dy = y - CENTRO_Y;
    const dist = Math.hypot(dx, dy);
    const proporcion = dist / extensionEn(Math.atan2(dy, dx), silueta);

    if (proporcion > 0.7) return paleta.claro;   // punta del pétalo
    if (proporcion < 0.45) return paleta.oscuro; // sombra junto al centro
    return paleta.base;
}

function esVacio(celdas, x, y) {
    if (x < 0 || y < 0 || x >= ANCHO || y >= ALTO) return true;
    return celdas[y * ANCHO + x] === VACIO;
}

function tocaPetalo(celdas, x, y) {
    const vecinos = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    return vecinos.some(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= ANCHO || ny >= ALTO) return true;
        return celdas[ny * ANCHO + nx] !== CENTRO;
    });
}

// --- Orden de floración ------------------------------------------------
// Primero sube el tallo, después la flor se abre desde el centro hacia afuera.

function ordenDe(celdas, x, y) {
    const tipo = celdas[y * ANCHO + x];
    if (tipo === TALLO || tipo === HOJA) return ALTO - y;
    return LARGO_TALLO + Math.round(Math.hypot(x - CENTRO_X, y - CENTRO_Y));
}

// --- API pública -------------------------------------------------------

/**
 * Devuelve el SVG de una flor como texto.
 * Se arma como string y no con createElementNS para que ande también fuera
 * del navegador: así se puede rasterizar la flor desde un script de Node y
 * mirarla sin levantar el sitio.
 *
 * @param {object} opciones
 * @param {string} opciones.silueta  clave de SILUETAS
 * @param {string} opciones.paleta   clave de PALETAS
 * @param {boolean} opciones.tallo   si false, recorta el SVG a la cabeza
 * @param {number} opciones.pasoMs   milisegundos entre "anillos" de floración
 * @param {boolean} opciones.animado si false, omite los --px-delay: la flor
 *        va a usarse como imagen plana (ver florDataURI), donde esos
 *        atributos no sirven de nada — el navegador rasteriza el SVG una
 *        sola vez, no puede animar el contenido de un <img>.
 */
export function florSVG({
    silueta = 'margarita',
    paleta = 'rosa',
    tallo = true,
    pasoMs = 55,
    animado = true
} = {}) {
    const forma = SILUETAS[silueta] ?? SILUETAS.margarita;
    const colores = PALETAS[paleta] ?? PALETAS.rosa;
    const celdas = construirGrilla(forma);

    const alto = tallo ? ALTO : ALTO_CABEZA;
    const partes = [];
    let maxOrden = 0;

    for (let y = 0; y < alto; y++) {
        for (let x = 0; x < ANCHO; x++) {
            const color = colorDe(celdas, x, y, forma, colores);
            if (!color) continue;

            // 1.02 en vez de 1: mata las costuras de medio píxel al escalar.
            if (animado) {
                const orden = ordenDe(celdas, x, y);
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

/** La misma flor, ya como elemento listo para insertar en el DOM: un <svg>
 * con un <rect> por píxel, para animar el florecer píxel por píxel. */
export function crearFlorSVG(opciones) {
    const doc = new DOMParser().parseFromString(florSVG(opciones), 'image/svg+xml');
    return document.importNode(doc.documentElement, true);
}

/**
 * La misma flor pero ya abierta y aplastada a un solo nodo: un <img> con
 * el SVG incrustado como data-URI. Mismo pixel art (`image-rendering:
 * pixelated` la mantiene nítida), pero sin un <rect> del DOM por píxel.
 * Para todo lo que no necesita animar el florecer: la decoración del
 * suelo, y las flores de sección una vez que ya terminaron de abrirse.
 */
export function florDataURI(opciones) {
    const svg = florSVG({ ...opciones, animado: false });
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function crearFlorIMG(opciones) {
    const img = document.createElement('img');
    img.className = 'flor-svg';
    img.src = florDataURI(opciones);
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    return img;
}

/** Cuánto tarda una flor en abrirse del todo, para encadenar la transición. */
export function duracionFloracion(pasoMs = 55) {
    return (LARGO_TALLO + Math.ceil(Math.hypot(CENTRO_X, CENTRO_Y)) + 2) * pasoMs;
}

export const DIMENSIONES = { ancho: ANCHO, alto: ALTO, altoCabeza: ALTO_CABEZA };
