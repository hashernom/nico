// ============================================================
//  EL MAPA DE NUESTROS MOMENTOS (sección Eventos)
//  El timeline se ve como un mapa en blanco hasta que se jura: "Juro
//  solemnemente que mis intenciones son buenas". Entonces la tinta
//  aparece, evento por evento, con huellas que marcan el camino. Al
//  final, "Travesura realizada" borra el mapa.
//
//  Es solo presentación: los eventos siguen siendo los de eventos.js; esto
//  muestra u oculta lo que ya está pintado.
// ============================================================

import { sonar } from '../lib/sonido.js';

const CLAVE = 'mapa-jurado';
const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function el(tag, clase, texto) {
    const nodo = document.createElement(tag);
    if (clase) nodo.className = clase;
    if (texto !== undefined) nodo.textContent = texto;
    return nodo;
}

function leer() {
    try {
        return sessionStorage.getItem(CLAVE) === '1';
    } catch (e) {
        return false;
    }
}

function guardar(valor) {
    try {
        if (valor) sessionStorage.setItem(CLAVE, '1');
        else sessionStorage.removeItem(CLAVE);
    } catch (e) {
        /* sin almacenamiento: el mapa se cierra al recargar */
    }
}

export function setupMapa() {
    const seccion = document.querySelector('.seccion[data-seccion="eventos"]');
    const lista = document.getElementById('checkpoints-list');
    if (!seccion || !lista) return;

    // --- Portada: el mapa en blanco con el juramento ---
    const puerta = el('div', 'merodeador-puerta');
    puerta.appendChild(el('p', 'merodeador-pista', 'Un pergamino en blanco. Parece que no hay nada... pero algo guarda.'));
    const juramento = el('button', 'merodeador-juramento', 'Juro solemnemente que mis intenciones son buenas');
    juramento.type = 'button';
    puerta.appendChild(juramento);

    // --- Encabezado del mapa, que aparece escrito ---
    const titulo = el('h3', 'merodeador-titulo', 'Santi y Nico presentan');
    const subtitulo = el('p', 'merodeador-subtitulo', 'el Mapa de Nuestros Momentos');
    const cabecera = el('div', 'merodeador-cabecera');
    cabecera.append(titulo, subtitulo);

    // --- Cierre ---
    const cierre = el('button', 'merodeador-cierre', 'Travesura realizada');
    cierre.type = 'button';

    seccion.prepend(puerta, cabecera);
    seccion.appendChild(cierre);

    function aplicar(abierto, { animar = false } = {}) {
        seccion.classList.toggle('mapa-abierto', abierto);
        puerta.hidden = abierto;
        cabecera.hidden = !abierto;
        cierre.hidden = !abierto;

        if (abierto && animar && !sinMovimiento) {
            // Cada evento aparece escrito, uno tras otro.
            lista.querySelectorAll('.timeline-item').forEach((item, i) => item.style.setProperty('--i', i));
            seccion.classList.add('mapa-revelando');
            setTimeout(() => seccion.classList.remove('mapa-revelando'), 2400 + lista.children.length * 130);
        }
    }

    juramento.addEventListener('click', () => {
        sonar('pagina');
        guardar(true);
        aplicar(true, { animar: true });
    });

    cierre.addEventListener('click', () => {
        sonar('cerrar');
        guardar(false);
        aplicar(false);
        seccion.closest('.panel-cuerpo')?.scrollTo({ top: 0, behavior: sinMovimiento ? 'auto' : 'smooth' });
    });

    aplicar(leer());
}
