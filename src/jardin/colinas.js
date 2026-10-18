// ============================================================
//  COLINAS DEL FONDO Y CASTILLO
//  Antes esto era una banda rectangular con un degradé adentro: se veía
//  como lo que era, un rectángulo verde cruzando la pantalla. Ahora son
//  siluetas de verdad, con la loma recortada contra el cielo, y entre la
//  colina lejana y la media asoma el castillo.
//
//  Mismo criterio que las flores: pixel art generado en código, nada de
//  PNGs. El perfil sale de una suma de senos cuantizada a la grilla de
//  píxeles. Los senos tienen período ENTERO sobre el ancho del tile, así
//  h(0) === h(ancho) y el tile se puede repetir en x sin costura visible,
//  que es lo que permite cubrir cualquier ancho de pantalla sin deformar
//  los píxeles.
// ============================================================

const ANCHO_TILE = 80;   // columnas de píxel por tile
const ALTO_TILE = 32;    // filas de píxel
const ESCALA = 4;        // tamaño de cada píxel en el SVG resultante
const ALTO_BORDE = 2;    // filas del reborde iluminado de arriba

// Tres capas, de atrás hacia adelante. Las de atrás son más claras y más
// altas (asoman por encima), las de adelante más oscuras y más bajas:
// perspectiva atmosférica, lo mismo que hace que un cerro lejano se vea
// lavado. `alto` es el % de la caja de .colinas que ocupa la capa.
const CAPAS = [
    {
        clase: 'colina-capa colina-capa--lejana',
        alto: 100,
        base: 13,
        ondas: [
            { k: 1, amp: 6, fase: 0.6 },
            { k: 3, amp: 2.5, fase: 2.1 }
        ],
        dia: { relleno: '#4F6E5A', borde: '#69896F' },
        noche: { relleno: '#1B2B3A', borde: '#26394B' }
    },
    {
        clase: 'colina-capa colina-capa--media',
        alto: 74,
        base: 12,
        ondas: [
            { k: 2, amp: 5, fase: 3.4 },
            { k: 5, amp: 1.8, fase: 0.9 }
        ],
        dia: { relleno: '#3F6A4C', borde: '#57845F' },
        noche: { relleno: '#15281F', borde: '#1E3629' }
    },
    {
        clase: 'colina-capa colina-capa--cercana',
        alto: 50,
        base: 11,
        ondas: [
            { k: 3, amp: 4, fase: 1.7 },
            { k: 7, amp: 1.4, fase: 2.8 }
        ],
        dia: { relleno: '#2F5A3E', borde: '#46754F' },
        noche: { relleno: '#0F1F17', borde: '#17291F' }
    }
];

export function setupColinas() {
    const colinas = document.querySelector('.colinas');
    if (!colinas) return;

    CAPAS.forEach((capa, indice) => {
        // El castillo va detrás de la colina media y la cercana, delante de
        // la lejana: así las lomas le tapan la base y se lo ve "asentado".
        if (indice === 1) colinas.appendChild(crearCastillo());

        const alturas = perfil(capa);
        const el = document.createElement('div');
        el.className = capa.clase;
        el.style.height = `${capa.alto}%`;
        // Las dos versiones se generan de una y el CSS elige cuál usar según
        // body.dark-mode: togglear el modo no tiene que regenerar nada.
        el.style.setProperty('--colina-dia', uri(alturas, capa.dia));
        el.style.setProperty('--colina-noche', uri(alturas, capa.noche));
        colinas.appendChild(el);
    });
}

/** Altura (en píxeles del tile) de la loma en cada columna. */
function perfil({ base, ondas }) {
    const alturas = [];

    for (let x = 0; x < ANCHO_TILE; x++) {
        let altura = base;
        for (const { k, amp, fase } of ondas) {
            altura += amp * Math.sin((2 * Math.PI * k * x) / ANCHO_TILE + fase);
        }
        // Redondear es lo que le da el escalón pixelado en vez de una curva
        // suave: sin esto no se distingue de un SVG vectorial cualquiera.
        alturas.push(Math.max(2, Math.min(ALTO_TILE, Math.round(altura))));
    }

    return alturas;
}

/** El tile como data URI, listo para usar de background-image. */
function uri(alturas, { relleno, borde }) {
    const rects = [];

    alturas.forEach((altura, x) => {
        const techo = ALTO_TILE - altura;

        // Cuerpo de la columna, desde el reborde hasta abajo del tile.
        rects.push(
            rect(x, techo + ALTO_BORDE, 1, altura - ALTO_BORDE, relleno)
        );
        // Reborde iluminado: la loma toma luz del cielo por arriba.
        rects.push(rect(x, techo, 1, ALTO_BORDE, borde));
    });

    const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" ` +
        `width="${ANCHO_TILE * ESCALA}" height="${ALTO_TILE * ESCALA}" ` +
        `viewBox="0 0 ${ANCHO_TILE} ${ALTO_TILE}" shape-rendering="crispEdges">` +
        rects.join('') +
        `</svg>`;

    // encodeURIComponent y no btoa: el SVG es ASCII y así queda legible al
    // inspeccionar, sin pasar por base64.
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function rect(x, y, ancho, alto, color) {
    // El +0.02 de ancho tapa las costuras de medio píxel entre columnas
    // vecinas cuando el navegador escala el tile.
    return `<rect x="${x}" y="${y}" width="${ancho + 0.02}" height="${alto}" fill="${color}"/>`;
}


// --- Castillo ------------------------------------------------------------
// Una silueta de torres con techos puntiagudos y ventanas encendidas. Se
// dibuja en una grilla de píxeles igual que las colinas, así que escala sin
// borronear. Las ventanas son lo único que no se apaga de noche.

const CASTILLO_ANCHO = 72;
const CASTILLO_ALTO = 40;
const CASTILLO_ESCALA = 4;

// x = columna izquierda, ancho IMPAR (el techo termina en punta de 1 px).
const TORRES = [
    { x: 6, ancho: 7, alto: 24, techo: 10 },
    { x: 20, ancho: 5, alto: 20, techo: 8 },
    { x: 33, ancho: 9, alto: 29, techo: 12 },
    { x: 50, ancho: 5, alto: 19, techo: 8 },
    { x: 59, ancho: 7, alto: 22, techo: 9 }
];
const SALON = { x: 12, ancho: 48, alto: 13 };

const COLORES_CASTILLO = {
    dia: { cuerpo: '#3C3566', techo: '#2A2350', ventana: '#FFD9A0' },
    noche: { cuerpo: '#171D40', techo: '#0E1230', ventana: '#FFD66B' }
};

function crearCastillo() {
    const el = document.createElement('div');
    el.className = 'castillo';
    el.setAttribute('aria-hidden', 'true');
    el.style.setProperty('--castillo-dia', castilloURI(COLORES_CASTILLO.dia));
    el.style.setProperty('--castillo-noche', castilloURI(COLORES_CASTILLO.noche));
    return el;
}

function castilloURI({ cuerpo, techo, ventana }) {
    const base = CASTILLO_ALTO;
    const rects = [];

    // Salón central con almenas.
    rects.push(rect(SALON.x, base - SALON.alto, SALON.ancho, SALON.alto, cuerpo));
    for (let x = SALON.x; x < SALON.x + SALON.ancho; x += 4) {
        rects.push(rect(x, base - SALON.alto - 1, 2, 1, cuerpo));
    }

    TORRES.forEach((torre, i) => {
        const cima = base - torre.alto;
        rects.push(rect(torre.x, cima, torre.ancho, torre.alto, cuerpo));

        // Techo: una pirámide escalonada, 1 px de voladizo a cada lado.
        const anchoBase = torre.ancho + 2;
        for (let fila = 0; fila < torre.techo; fila++) {
            const recorte = Math.floor((fila * ((anchoBase + 1) / 2)) / torre.techo);
            const ancho = Math.max(1, anchoBase - 2 * recorte);
            const x = torre.x - 1 + recorte;
            rects.push(rect(x, cima - 1 - fila, ancho, 1, techo));
        }

        // Ventanas: alternadas a distinta altura para que no parezcan una tabla.
        for (let y = cima + 3 + (i % 2) * 2; y < base - 4; y += 6) {
            rects.push(rect(torre.x + Math.floor(torre.ancho / 2), y, 1, 2, ventana));
        }
    });

    // Ventanas del salón.
    for (let x = SALON.x + 3; x < SALON.x + SALON.ancho - 2; x += 5) {
        if (TORRES.some((t) => x >= t.x - 1 && x <= t.x + t.ancho)) continue;
        rects.push(rect(x, base - SALON.alto + 4, 1, 3, ventana));
    }

    const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" ` +
        `width="${CASTILLO_ANCHO * CASTILLO_ESCALA}" height="${CASTILLO_ALTO * CASTILLO_ESCALA}" ` +
        `viewBox="0 0 ${CASTILLO_ANCHO} ${CASTILLO_ALTO}" shape-rendering="crispEdges">` +
        rects.join('') +
        `</svg>`;

    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
