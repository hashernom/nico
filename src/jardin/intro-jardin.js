// ============================================================
//  INTRO: la lechuza, la carta y los objetos mágicos
//  1. Una lechuza cruza el cielo y deja caer una carta.
//  2. Se rompe el sello de lacre.
//  3. Los siete objetos se materializan píxel por píxel sobre sus
//     pedestales.
//  4. Al tocar, la cámara sube y aparecen los terrenos del castillo.
// ============================================================

import { crearObjetoSVG, OBJETOS, duracionAparicion } from './sprite.js';
import { crearLechuza } from './criaturas.js';
import { mostrarJardin } from './jardin.js';
import { sonar } from '../lib/sonido.js';
import { SECCIONES } from './secciones.js';

const CLAVE_SESION = 'jardin-intro-vista';
const RETRASO_ENTRE_FLORES = 260;
const DURACION_SUBIDA = 1100;
const DURACION_CARTA = 900;

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

    const carta = document.getElementById('introCarta');
    const cartaPapel = document.getElementById('cartaIntro');
    const sello = document.getElementById('introSello');
    const lechuzas = document.getElementById('introLechuzas');
    const contenedor = document.getElementById('introFlores');
    const pista = document.getElementById('introPista');

    // Dos lechuzas superpuestas: la que lleva la carta se apaga a mitad de
    // vuelo y entra la que ya no la lleva (el CSS coordina el momento).
    lechuzas.append(crearLechuza({ conCarta: true }), crearLechuza({ conCarta: false }));
    lechuzas.children[0].classList.add('lechuza--con');
    lechuzas.children[1].classList.add('lechuza--sin');
    intro.classList.add('con-carta');
    sonar('lechuza');

    let saliendo = false;
    let avisar = null;

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

    function materializarObjetos() {
        // Solo los objetos de las secciones visibles (el sombrero puede estar oculto).
        const objetos = SECCIONES.map((s) => s.objeto).filter((o) => o in OBJETOS);

        objetos.forEach((objeto, indice) => {
            const tallo = document.createElement('div');
            tallo.className = 'intro-flor';
            // Alturas alternadas: una hilera pareja parece un cerco, no un patio.
            tallo.style.setProperty('--alto', indice % 2 === 0 ? '78%' : '100%');
            tallo.style.setProperty('--flor-retraso', `${indice * RETRASO_ENTRE_FLORES}ms`);
            tallo.appendChild(crearObjetoSVG({ objeto }));
            contenedor.appendChild(tallo);
        });

        const total = duracionAparicion() + (objetos.length - 1) * RETRASO_ENTRE_FLORES;
        avisar = setTimeout(() => pista?.classList.add('visible'), total);

        // Recién ahora el toque en cualquier lado entra al jardín.
        intro.addEventListener('click', salir);
        intro.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                salir();
            }
        });
        intro.tabIndex = 0;
        intro.setAttribute('role', 'button');
        intro.setAttribute('aria-label', 'Entrar al castillo');
        intro.focus({ preventScroll: true });
    }

    // Se puede romper el sello sin esperar a que termine la caída de la carta.
    sello.focus({ preventScroll: true });
    sello.addEventListener(
        'click',
        (e) => {
            e.stopPropagation();
            sonar('sello');
            cartaPapel.classList.add('abierta');
            carta.classList.add('abierta');
            // El sello es lo único tocable: se retira para que el toque
            // siguiente no se confunda con "entrar".
            sello.disabled = true;
            setTimeout(() => {
                carta.remove();
                materializarObjetos();
            }, DURACION_CARTA);
        },
        { once: true }
    );
}
