// ============================================================
//  CRIATURAS Y ESCUDOS (pixel art en código)
//  La lechuza que reparte cartas, el Sombrero Seleccionador con cara y
//  los escudos de las cuatro casas. Mismo generador que los objetos del
//  jardín (lienzo.js): nada de PNGs.
//
//  Los escudos son originales (un león, una serpiente, un águila, un
//  tejón sobre un escudo de color), no los emblemas oficiales.
// ============================================================

import { crearLienzo, celdasASVG, aDataURI } from './lienzo.js';

// --- Casas ---------------------------------------------------------------

export const CASAS = {
    gryffindor: {
        id: 'gryffindor',
        nombre: 'Gryffindor',
        animal: 'león',
        color: '#9B2335',
        colorOscuro: '#5E1220',
        acento: '#F0C75A',
        texto: '#FFE9A8',
        virtudes: 'valentía, osadía y corazón'
    },
    slytherin: {
        id: 'slytherin',
        nombre: 'Slytherin',
        animal: 'serpiente',
        color: '#1F6B45',
        colorOscuro: '#0F3A25',
        acento: '#C9D2DE',
        texto: '#E4F5EA',
        virtudes: 'ambición, astucia y determinación'
    },
    ravenclaw: {
        id: 'ravenclaw',
        nombre: 'Ravenclaw',
        animal: 'águila',
        color: '#2B4C95',
        colorOscuro: '#16285A',
        acento: '#C79A52',
        texto: '#E3ECFF',
        virtudes: 'ingenio, curiosidad y sabiduría'
    },
    hufflepuff: {
        id: 'hufflepuff',
        nombre: 'Hufflepuff',
        animal: 'tejón',
        color: '#E3B83A',
        colorOscuro: '#8A6A12',
        acento: '#1E1A14',
        texto: '#2A210A',
        virtudes: 'lealtad, paciencia y justicia'
    }
};

export const ID_CASAS = Object.keys(CASAS);

// --- Escudos ---------------------------------------------------------------

const ESC_ANCHO = 15;
const ESC_ALTO = 18;

function pintarEscudo(g, casa) {
    // Forma de escudo: recto arriba, punta abajo.
    for (let y = 0; y < ESC_ALTO; y++) {
        const mitad = y < 10 ? 7 : Math.max(0, 7 - (y - 9) * 0.85);
        for (let x = 7 - Math.floor(mitad); x <= 7 + Math.floor(mitad); x++) g.px(x, y, 'escudo');
    }
    g.rect(1, 1, 13, 1, 'escudoClaro');

    switch (casa) {
        case 'gryffindor': {
            // Melena y cara de león.
            g.disco(7, 8, 4.6, 'emblema');
            g.disco(7, 8.6, 2.7, 'escudo');
            g.px(6, 8, 'emblema');
            g.px(8, 8, 'emblema');
            g.px(7, 10, 'emblema');
            g.px(6, 11, 'emblema');
            g.px(8, 11, 'emblema');
            break;
        }
        case 'slytherin': {
            // Una S de serpiente con la cabeza arriba a la derecha.
            const tramos = [
                [10, 3, 7, 3], [7, 3, 5, 5], [5, 5, 7, 7],
                [7, 7, 9, 9], [9, 9, 7, 12], [7, 12, 4, 13]
            ];
            tramos.forEach(([x0, y0, x1, y1]) => g.linea(x0, y0, x1, y1, 'emblema', 2));
            g.px(10, 3, 'escudo');
            g.px(11, 4, 'emblema');
            g.px(12, 3, 'lengua');
            break;
        }
        case 'ravenclaw': {
            // Águila con las alas abiertas.
            g.elipse(7, 9, 1.8, 3.8, 'emblema');
            g.disco(7, 5, 1.8, 'emblema');
            g.px(7, 6, 'pico');
            g.px(6, 5, 'escudo');
            [[-1, 1], [1, 1]].forEach(([lado]) => {
                g.linea(7 + lado * 2, 8, 7 + lado * 6, 4, 'emblema', 1);
                g.linea(7 + lado * 2, 9, 7 + lado * 6, 6, 'emblema', 1);
                g.linea(7 + lado * 2, 10, 7 + lado * 5, 8, 'emblema', 1);
                g.linea(7 + lado * 2, 11, 7 + lado * 4, 10, 'emblema', 1);
            });
            break;
        }
        case 'hufflepuff': {
            // Cabeza de tejón: antifaz negro con raya clara al medio.
            g.disco(3.4, 4.6, 1.5, 'emblema');
            g.disco(10.6, 4.6, 1.5, 'emblema');
            for (let y = 0; y < ESC_ALTO; y++) {
                for (let x = 0; x < ESC_ALTO; x++) {
                    if (Math.hypot(x - 7, y - 9) <= 4.6) g.px(x, y, x >= 6 && x <= 8 ? 'raya' : 'emblema');
                }
            }
            g.px(4, 9, 'raya');
            g.px(10, 9, 'raya');
            g.px(7, 12, 'emblema');
            break;
        }
        default:
    }
}

export function escudoSVG(casa) {
    const c = CASAS[casa] ?? CASAS.gryffindor;
    const g = crearLienzo(ESC_ANCHO, ESC_ALTO);
    pintarEscudo(g, casa);
    return celdasASVG(
        g,
        {
            escudo: c.color,
            escudoClaro: mezclar(c.color, '#ffffff', 0.35),
            emblema: c.acento,
            raya: casa === 'hufflepuff' ? '#F7ECC2' : c.acento,
            lengua: '#E45B6B',
            pico: casa === 'ravenclaw' ? '#F0C75A' : c.acento
        },
        { clase: 'escudo-svg' }
    );
}

export function escudoDataURI(casa) {
    return aDataURI(escudoSVG(casa));
}

export function crearEscudoIMG(casa) {
    const img = document.createElement('img');
    img.className = 'escudo-img';
    img.src = escudoDataURI(casa);
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    return img;
}

function mezclar(hex, con, t) {
    const a = parseInt(hex.slice(1), 16);
    const b = parseInt(con.slice(1), 16);
    const canal = (s) => Math.round(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t);
    return `#${[16, 8, 0].map((s) => canal(s).toString(16).padStart(2, '0')).join('')}`;
}

// --- Lechuza ---------------------------------------------------------------
// Dos cuadros de aleteo (alas arriba / alas abajo); el CSS alterna cuál se ve.

const LECH_ANCHO = 30;
const LECH_ALTO = 22;

const COLORES_LECHUZA = {
    cuerpo: '#8C6B4B',
    cuerpoClaro: '#B08D68',
    vientre: '#E8D6B0',
    ala: '#6F5238',
    alaClara: '#9A7A58',
    ojo: '#FFF4C8',
    pupila: '#1A1020',
    pico: '#E0A23A',
    garra: '#C98F2E',
    sobre: '#EBD9A8',
    sobreOscuro: '#C9AE72',
    lacre: '#9C1F34'
};

function pintarLechuza(g, alas, conCarta) {
    const cx = 15;
    // Alas: un abanico de plumas, hacia arriba o hacia abajo.
    [-1, 1].forEach((lado) => {
        const X = (dx) => cx + lado * dx;
        if (alas === 'arriba') {
            g.poligono([[X(3), 8], [X(13), 0], [X(14), 6], [X(12), 11], [X(3), 14]], 'ala');
            g.poligono([[X(4), 9], [X(11), 4], [X(12), 8], [X(9), 12], [X(4), 13]], 'alaClara');
        } else {
            g.poligono([[X(3), 9], [X(14), 13], [X(14), 20], [X(10), 19], [X(3), 15]], 'ala');
            g.poligono([[X(4), 10], [X(12), 13], [X(12), 17], [X(9), 16], [X(4), 14]], 'alaClara');
        }
    });

    // Cuerpo, vientre y cabeza.
    g.elipse(cx, 12, 4.6, 6.4, 'cuerpo');
    g.elipse(cx, 13.2, 2.9, 4.6, 'vientre');
    g.disco(cx, 6, 4, 'cuerpo');
    g.px(cx - 3, 2, 'cuerpo');
    g.px(cx + 3, 2, 'cuerpo');
    g.px(cx - 3, 3, 'cuerpoClaro');
    g.px(cx + 3, 3, 'cuerpoClaro');

    // Cara: dos ojos redondos y pico.
    g.disco(cx - 1.9, 6, 1.5, 'ojo');
    g.disco(cx + 1.9, 6, 1.5, 'ojo');
    g.px(cx - 2, 6, 'pupila');
    g.px(cx + 2, 6, 'pupila');
    g.px(cx, 8, 'pico');
    g.px(cx, 9, 'pico');

    // Plumas del pecho.
    g.px(cx - 1, 12, 'cuerpoClaro');
    g.px(cx + 1, 14, 'cuerpoClaro');
    g.px(cx, 16, 'cuerpoClaro');

    // Garras y, si lleva, la carta.
    g.px(cx - 2, 18, 'garra');
    g.px(cx + 2, 18, 'garra');
    if (conCarta) {
        g.rect(cx - 4, 18, 9, 4, 'sobre');
        g.rect(cx - 4, 21, 9, 1, 'sobreOscuro');
        g.px(cx, 20, 'lacre');
        g.px(cx - 1, 19, 'sobreOscuro');
        g.px(cx + 1, 19, 'sobreOscuro');
    }
}

export function lechuzaSVG({ alas = 'arriba', conCarta = true } = {}) {
    const g = crearLienzo(LECH_ANCHO, LECH_ALTO);
    pintarLechuza(g, alas, conCarta);
    return celdasASVG(g, COLORES_LECHUZA, { clase: `lechuza-svg lechuza-${alas}` });
}

/** La lechuza ya armada: los dos cuadros apilados, el CSS alterna su opacidad. */
export function crearLechuza({ conCarta = true } = {}) {
    const caja = document.createElement('div');
    caja.className = 'lechuza';
    caja.setAttribute('aria-hidden', 'true');
    caja.innerHTML = lechuzaSVG({ alas: 'arriba', conCarta }) + lechuzaSVG({ alas: 'abajo', conCarta });
    return caja;
}

// --- Sombrero Seleccionador ---------------------------------------------------

const SOM_ANCHO = 34;
const SOM_ALTO = 38;

const COLORES_SOMBRERO = {
    tela: '#7B5B37',
    telaClara: '#9C794A',
    telaOscura: '#4F3720',
    remiendo: '#6A4A2A',
    hilo: '#C9AE72',
    ojoBlanco: '#F1E6C9',
    pupila: '#1A1020',
    ceja: '#3B2814',
    bocaCierre: '#2B1A0E',
    bocaBorde: '#140c1f',
    bocaDentro: '#2A0F14',
    lengua: '#B3485A'
};

function pintarSombrero(g) {
    // Ala: una elipse ancha con un borde más oscuro por debajo.
    g.elipse(17, 33, 16, 3.8, 'telaOscura');
    g.elipse(17, 32, 16, 3.6, 'tela');
    g.rect(2, 31, 30, 1, 'telaClara');

    // Cono: el eje se inclina hacia la derecha y la punta cae doblada.
    for (let y = 3; y <= 32; y++) {
        const t = (y - 3) / 29;
        const mitad = 1.6 + t * 12.6;
        let centro = 17;
        if (y < 17) centro += (17 - y) * 0.42;
        if (y < 7) centro += (7 - y) * 0.9; // la punta cuelga
        const yy = y < 6 ? y + (6 - y) * 0.0 : y;
        for (let x = Math.round(centro - mitad); x <= Math.round(centro + mitad); x++) {
            g.px(x, yy, x < centro - mitad * 0.45 ? 'telaClara' : x > centro + mitad * 0.55 ? 'telaOscura' : 'tela');
        }
    }

    // Dobleces.
    g.linea(8, 17, 24, 16, 'telaOscura', 1);
    g.linea(6, 24, 27, 23, 'telaOscura', 1);

    // Remiendo con puntadas.
    g.rect(21, 11, 4, 4, 'remiendo');
    g.px(21, 11, 'hilo');
    g.px(24, 11, 'hilo');
    g.px(21, 14, 'hilo');
    g.px(24, 14, 'hilo');

    // Cara: cejas, ojos y una arruga de nariz.
    g.linea(10, 19, 14, 20, 'ceja', 1);
    g.linea(20, 20, 24, 19, 'ceja', 1);
    g.rect(11, 21, 3, 2, 'ojoBlanco');
    g.rect(21, 21, 3, 2, 'ojoBlanco');
    g.px(12, 22, 'pupila');
    g.px(22, 22, 'pupila');
    g.px(17, 24, 'telaOscura');
    g.px(17, 25, 'telaOscura');

    // Boca: una línea cerrada y una abierta (el CSS alterna cuál se ve).
    g.linea(11, 28, 14, 29, '@boca-c:bocaCierre', 1);
    g.rect(15, 29, 5, 1, '@boca-c:bocaCierre');
    g.linea(20, 29, 23, 28, '@boca-c:bocaCierre', 1);
    g.elipse(17, 28.5, 6.4, 3.2, '@boca-a:bocaBorde');
    g.elipse(17, 28.5, 5.2, 2.4, '@boca-a:bocaDentro');
    g.rect(15, 29, 4, 1, '@boca-a:lengua');
}

export function sombreroSVG() {
    const g = crearLienzo(SOM_ANCHO, SOM_ALTO);
    pintarSombrero(g);
    return celdasASVG(g, COLORES_SOMBRERO, { clase: 'sombrero-svg' });
}

export function crearSombrero() {
    const caja = document.createElement('div');
    caja.className = 'sombrero-vivo';
    caja.setAttribute('aria-hidden', 'true');
    caja.innerHTML = sombreroSVG();
    return caja;
}

// --- Objeto del jardín: el sombrero sobre su pedestal ----------------------
// Versión chica (17×17) para la lista OBJETOS de sprite.js.

export const OBJETO_SOMBRERO = {
    paleta: {
        tela: '#7B5B37', telaClara: '#9C794A', telaOscura: '#4F3720',
        ojoBlanco: '#F1E6C9', pupila: '#1A1020', boca: '#2B1A0E', hilo: '#C9AE72'
    },
    pintar(g) {
        g.elipse(8, 14, 8, 2.4, 'telaOscura');
        g.elipse(8, 13.4, 8, 2.2, 'tela');
        for (let y = 1; y <= 13; y++) {
            const t = (y - 1) / 12;
            const mitad = 0.8 + t * 6.2;
            let centro = 8;
            if (y < 8) centro += (8 - y) * 0.45;
            if (y < 4) centro += (4 - y) * 0.9;
            for (let x = Math.round(centro - mitad); x <= Math.round(centro + mitad); x++) {
                g.px(x, y, x < centro - mitad * 0.4 ? 'telaClara' : x > centro + mitad * 0.55 ? 'telaOscura' : 'tela');
            }
        }
        g.rect(5, 8, 2, 1, 'ojoBlanco');
        g.rect(10, 8, 2, 1, 'ojoBlanco');
        g.px(6, 8, 'pupila');
        g.px(11, 8, 'pupila');
        g.linea(6, 11, 11, 11, 'boca', 1);
        g.px(12, 5, 'hilo');
        g.px(11, 5, 'hilo');
    }
};
