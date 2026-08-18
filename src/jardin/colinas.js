// ============================================================
//  COLINAS DEL FONDO
//  Antes esto era una banda rectangular con un degradé adentro: se veía
//  como lo que era, un rectángulo verde cruzando la pantalla. Ahora son
//  siluetas de verdad, con la loma recortada contra el cielo.
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
        dia: { relleno: '#7FA85C', borde: '#95BE72' },
        noche: { relleno: '#33492a', borde: '#3f5734' }
    },
    {
        clase: 'colina-capa colina-capa--media',
        alto: 74,
        base: 12,
        ondas: [
            { k: 2, amp: 5, fase: 3.4 },
            { k: 5, amp: 1.8, fase: 0.9 }
        ],
        dia: { relleno: '#6B9648', borde: '#80AC5B' },
        noche: { relleno: '#2b3f23', borde: '#354c2b' }
    },
    {
        clase: 'colina-capa colina-capa--cercana',
        alto: 50,
        base: 11,
        ondas: [
            { k: 3, amp: 4, fase: 1.7 },
            { k: 7, amp: 1.4, fase: 2.8 }
        ],
        dia: { relleno: '#5A8038', borde: '#6E9446' },
        noche: { relleno: '#22331c', borde: '#2b3f23' }
    }
];

export function setupColinas() {
    const colinas = document.querySelector('.colinas');
    if (!colinas) return;

    CAPAS.forEach((capa) => {
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
