import { fotosActuales, urlPublica } from './galeria.js';

// Antes el lightbox capturaba los nodos del DOM con un setTimeout de 300ms.
// Ahora lee la lista de fotos en el momento de abrirse, así no se desincroniza
// cuando alguien sube o borra una foto.

let indiceActual = -1;
let elementos = null;

export function setupLightbox() {
    const overlay = document.getElementById('lightboxOverlay');
    if (!overlay) return;

    elementos = {
        overlay,
        img: document.getElementById('lightboxImg'),
        caption: document.getElementById('lightboxCaption'),
        contador: document.getElementById('lightboxCounter'),
        cerrar: document.getElementById('lightboxClose'),
        anterior: document.getElementById('lightboxPrev'),
        siguiente: document.getElementById('lightboxNext')
    };

    elementos.anterior.addEventListener('click', () => navegar(-1));
    elementos.siguiente.addEventListener('click', () => navegar(1));
    elementos.anterior.addEventListener('touchstart', (e) => {
        e.preventDefault();
        navegar(-1);
    });
    elementos.siguiente.addEventListener('touchstart', (e) => {
        e.preventDefault();
        navegar(1);
    });
    elementos.cerrar.addEventListener('click', cerrarLightbox);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cerrarLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (!overlay.classList.contains('active')) return;
        if (e.key === 'Escape') {
            // Marca para quien escuche después: este Escape ya tiene dueño.
            // El jardín también cierra con Escape y los dos handlers viven en
            // document, así que no alcanza con mirar si el lightbox está abierto.
            e.tomadoPorLightbox = true;
            cerrarLightbox();
        }
        if (e.key === 'ArrowLeft') navegar(-1);
        if (e.key === 'ArrowRight') navegar(1);
    });

    let inicioX = 0;
    overlay.addEventListener('touchstart', (e) => {
        inicioX = e.touches[0].clientX;
    });
    overlay.addEventListener('touchend', (e) => {
        const diff = inicioX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 60) navegar(diff > 0 ? 1 : -1);
    });
}

export function abrirLightbox(indice) {
    const fotos = fotosActuales();
    if (!elementos || fotos.length === 0) return;

    indiceActual = indice;
    const foto = fotos[indice];

    elementos.img.src = urlPublica(foto.storage_path);
    elementos.img.alt = foto.caption || '';
    elementos.caption.textContent = foto.caption || ' ';
    elementos.contador.textContent = `${indice + 1} / ${fotos.length}`;
    elementos.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function navegar(delta) {
    const fotos = fotosActuales();
    if (fotos.length === 0) return;

    let nuevo = indiceActual + delta;
    if (nuevo < 0) nuevo = fotos.length - 1;
    if (nuevo >= fotos.length) nuevo = 0;
    abrirLightbox(nuevo);
}

function cerrarLightbox() {
    elementos.overlay.classList.remove('active');
    document.body.style.overflow = '';
    indiceActual = -1;
}
