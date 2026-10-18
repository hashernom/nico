// ============================================================
//  LIENZO DE PÍXELES
//  Una grilla de celdas con nombre de color y unos pocos pintores
//  (px, rect, disco, línea). Lo comparten los objetos del jardín, la
//  lechuza, el sombrero y los escudos de las casas. El contorno oscuro
//  se deriva de la grilla (donde una celda toca el vacío): los pintores
//  solo eligen colores de relleno y brillos.
// ============================================================

export const BORDE = '#140c1f';

export function crearLienzo(ancho, alto) {
    const celdas = new Array(ancho * alto).fill(null);
    const dentro = (x, y) => x >= 0 && y >= 0 && x < ancho && y < alto;

    const g = {
        ancho,
        alto,
        celdas,
        // Una clave `@grupo:color` va a una capa aparte (se dibuja encima, sin
        // contorno y sin borrar lo que hay debajo): así la boca abierta del
        // sombrero puede mostrarse u ocultarse sin dejar un agujero.
        capas: new Map(),
        px(x, y, color) {
            if (!dentro(x, y)) return;
            const m = typeof color === 'string' ? /^@([\w-]+):(.+)$/.exec(color) : null;
            if (m) {
                if (!g.capas.has(m[1])) g.capas.set(m[1], new Map());
                g.capas.get(m[1]).set(y * ancho + x, m[2]);
                return;
            }
            celdas[y * ancho + x] = color;
        },
        rect(x, y, w, h, color) {
            for (let j = 0; j < h; j++) {
                for (let i = 0; i < w; i++) g.px(x + i, y + j, color);
            }
        },
        disco(cx, cy, radio, color) {
            for (let y = 0; y < alto; y++) {
                for (let x = 0; x < ancho; x++) {
                    if (Math.hypot(x - cx, y - cy) <= radio) g.px(x, y, color);
                }
            }
        },
        // Elipse rellena, para pétalos, alas y cuerpos.
        elipse(cx, cy, rx, ry, color) {
            for (let y = 0; y < alto; y++) {
                for (let x = 0; x < ancho; x++) {
                    if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) g.px(x, y, color);
                }
            }
        },
        // Polígono relleno (par-impar), para alas y velas.
        poligono(puntos, color) {
            for (let y = 0; y < alto; y++) {
                for (let x = 0; x < ancho; x++) {
                    let dentroPoligono = false;
                    for (let i = 0, j = puntos.length - 1; i < puntos.length; j = i++) {
                        const [xi, yi] = puntos[i];
                        const [xj, yj] = puntos[j];
                        if (yi > y + 0.5 !== yj > y + 0.5 &&
                            x + 0.5 < ((xj - xi) * (y + 0.5 - yi)) / (yj - yi) + xi) {
                            dentroPoligono = !dentroPoligono;
                        }
                    }
                    if (dentroPoligono) g.px(x, y, color);
                }
            }
        },
        // Bresenham; `grosor` 2 repite el píxel una columna a la derecha y
        // 3 también una fila hacia abajo.
        linea(x0, y0, x1, y1, color, grosor = 1) {
            const dx = Math.abs(x1 - x0);
            const dy = Math.abs(y1 - y0);
            const sx = x0 < x1 ? 1 : -1;
            const sy = y0 < y1 ? 1 : -1;
            let err = dx - dy;
            let x = x0;
            let y = y0;
            for (;;) {
                g.px(x, y, color);
                if (grosor > 1) g.px(x + 1, y, color);
                if (grosor > 2) {
                    g.px(x, y + 1, color);
                    g.px(x + 1, y + 1, color);
                }
                if (x === x1 && y === y1) break;
                const e2 = 2 * err;
                if (e2 > -dy) { err -= dy; x += sx; }
                if (e2 < dx) { err += dx; y += sy; }
            }
        }
    };
    return g;
}

/**
 * Convierte una grilla a SVG de texto: un <rect> por celda. Las celdas que
 * tocan el vacío pasan a ser borde, salvo las claves de `sinBorde`.
 *
 * Las claves `@grupo:color` se dibujan en una capa <g class="grupo"> encima
 * de la base (ver `px`).
 */
export function celdasASVG(g, colores, { sinBorde = new Set(), clase = 'flor-svg', extra = '' } = {}) {
    const { ancho, alto, celdas } = g;
    const vacio = (x, y) =>
        x < 0 || y < 0 || x >= ancho || y >= alto || celdas[y * ancho + x] === null;

    const base = [];
    for (let y = 0; y < alto; y++) {
        for (let x = 0; x < ancho; x++) {
            const clave = celdas[y * ancho + x];
            if (!clave) continue;

            const borde =
                !sinBorde.has(clave) &&
                (vacio(x - 1, y) || vacio(x + 1, y) || vacio(x, y - 1) || vacio(x, y + 1));
            const color = borde ? BORDE : colores[clave] ?? '#ff00ff';
            // 1.02 en vez de 1: mata las costuras de medio píxel al escalar.
            base.push(`<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${color}"/>`);
        }
    }

    // Las capas (`@grupo:`) van en un <g class="grupo"> para que el CSS las
    // pueda mostrar u ocultar.
    const capas = [...g.capas].map(([nombre, mapa]) => {
        const rects = [...mapa].map(([i, clave]) => {
            const x = i % ancho;
            const y = Math.floor(i / ancho);
            return `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${colores[clave] ?? '#ff00ff'}"/>`;
        });
        return `<g class="${nombre}">${rects.join('')}</g>`;
    });

    return (
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ancho} ${alto}" ` +
        `width="${ancho}" height="${alto}" class="${clase}" shape-rendering="crispEdges" ` +
        `aria-hidden="true" focusable="false"${extra}>${base.join('')}${capas.join('')}</svg>`
    );
}

export function aDataURI(svg) {
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
