// ============================================================
//  INTRO: las flores floreciendo
//  Seis flores pixeladas de distinto color se abren píxel por píxel.
//  Al tocar, la cámara sube y aparece el jardín aéreo.
// ============================================================

import { crearFlorSVG, PALETAS, SILUETAS, duracionFloracion } from './sprite.js';
import { mostrarJardin } from './jardin.js';

const CLAVE_SESION = 'jardin-intro-vista';
const RETRASO_ENTRE_FLORES = 260;
const DURACION_SUBIDA = 1100;

const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function setupIntroJardin() {
    const intro = document.getElementById('intro');
    if (!intro) {
        mostrarJardin();
        return;
    }

    // La intro es linda una vez. En cada recarga es un peaje.
    const yaVista = sessionStorage.getItem(CLAVE_SESION) === '1';
    if (sinMovimiento || yaVista) {
        intro.remove();
        mostrarJardin();
        return;
    }

    const contenedor = document.getElementById('introFlores');
    const pista = document.getElementById('introPista');
    const paletas = Object.keys(PALETAS);
    const siluetas = Object.keys(SILUETAS);

    paletas.forEach((paleta, indice) => {
        const tallo = document.createElement('div');
        tallo.className = 'intro-flor';
        // Alturas alternadas: una hilera pareja parece un cerco, no un cantero.
        tallo.style.setProperty('--alto', indice % 2 === 0 ? '78%' : '100%');
        tallo.style.setProperty('--flor-retraso', `${indice * RETRASO_ENTRE_FLORES}ms`);
        tallo.appendChild(
            crearFlorSVG({ paleta, silueta: siluetas[indice % siluetas.length] })
        );
        contenedor.appendChild(tallo);
    });

    const total = duracionFloracion() + (paletas.length - 1) * RETRASO_ENTRE_FLORES;
    const avisar = setTimeout(() => pista?.classList.add('visible'), total);

    let saliendo = false;

    function salir() {
        if (saliendo) return;
        saliendo = true;
        clearTimeout(avisar);
        sessionStorage.setItem(CLAVE_SESION, '1');

        // La cámara sube: la intro se va hacia abajo mientras el jardín entra.
        intro.classList.add('subiendo');
        mostrarJardin();
        setTimeout(() => intro.remove(), DURACION_SUBIDA);
    }

    intro.addEventListener('click', salir);
    intro.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            salir();
        }
    });
    intro.tabIndex = 0;
    intro.setAttribute('role', 'button');
    intro.setAttribute('aria-label', 'Entrar al jardín');
}
