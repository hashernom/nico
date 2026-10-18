// ============================================================
//  LA LECHUZA DE LAS CARTAS
//  Al abrir la sección Cartas, una lechuza cruza el panel y los sobres
//  van cayendo en su lugar. Al guardar una carta nueva, la lechuza se la
//  lleva. Puro adorno: con movimiento reducido no hace nada y los sobres
//  se ven de entrada.
// ============================================================

import { crearLechuza } from '../jardin/criaturas.js';
import { sonar } from '../lib/sonido.js';

const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function volar(panel, { desde, hasta, duracion }) {
    const ave = crearLechuza({ conCarta: true });
    ave.classList.add('lechuza-vuelo');
    panel.appendChild(ave);
    const anim = ave.animate(
        [
            { transform: `translate(${desde[0]}, ${desde[1]})`, offset: 0 },
            { transform: `translate(${hasta[0]}, ${hasta[1]})`, offset: 1 }
        ],
        { duration: duracion, easing: 'cubic-bezier(0.4, 0, 0.6, 1)' }
    );
    anim.onfinish = () => ave.remove();
}

export function setupLechuza() {
    const panel = document.getElementById('panelMadera');
    const lista = document.getElementById('cartasLista');
    if (!panel || !lista || sinMovimiento) return;

    let abiertaEnEstaVisita = false;

    document.addEventListener('seccion-abierta', (e) => {
        if (e.detail?.id !== 'cartas') return;

        // Los sobres esperan a que la lechuza pase por encima.
        lista.classList.remove('llegan');
        lista.classList.add('espera-lechuza');
        sonar('lechuza');
        volar(panel, { desde: ['-30%', '40px'], hasta: ['110%', '90px'], duracion: 2200 });

        setTimeout(() => {
            lista.classList.remove('espera-lechuza');
            lista.classList.add('llegan');
        }, 950);
        abiertaEnEstaVisita = true;
    });

    document.addEventListener('seccion-cerrada', () => {
        lista.classList.remove('espera-lechuza', 'llegan');
        abiertaEnEstaVisita = false;
    });

    // Cuando se guarda una carta, la lechuza se la lleva.
    document.addEventListener('carta-enviada', () => {
        if (!abiertaEnEstaVisita) return;
        sonar('lechuza');
        volar(panel, { desde: ['-20%', '70%'], hasta: ['115%', '-10%'], duracion: 2000 });
    });
}
