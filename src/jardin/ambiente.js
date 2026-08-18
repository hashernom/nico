// ============================================================
//  AMBIENTE: nubes, luna, estrellas, luciérnagas
//  Puro adorno del jardín, no toca datos. Los dos juegos de elementos
//  (día y noche) se generan una sola vez y conviven en el DOM: el CSS
//  decide cuál se ve según body.dark-mode, así togglear el modo oscuro
//  no tiene que volver a crear nada.
// ============================================================

const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function setupAmbiente() {
    const cielo = document.querySelector('.cielo');
    const pasto = document.querySelector('.pasto');
    if (!cielo) return;

    crearNubes(cielo);
    crearNoche(cielo);
    if (pasto) crearLuciernagas(pasto);
}

// --- Día: nubes ---------------------------------------------------------

const NUBES = [
    { ancho: 74, alto: 6, duracion: 78, retraso: -10 },
    { ancho: 104, alto: 20, duracion: 96, retraso: -55 },
    { ancho: 58, alto: 32, duracion: 64, retraso: -20 }
];

function crearNubes(cielo) {
    const contenedor = document.createElement('div');
    contenedor.className = 'cielo-nubes';

    NUBES.forEach(({ ancho, alto, duracion, retraso }, indice) => {
        const nube = document.createElement('div');
        nube.className = 'nube';
        nube.style.setProperty('--ancho', `${ancho}px`);
        nube.style.setProperty('--alto', `${alto}%`);

        if (sinMovimiento) {
            // Sin la deriva, dejarla animada la termina empujando fuera de
            // cámara (fill-mode vuelve al estado base al terminar el único
            // frame). Mejor una nube quieta y visible.
            nube.style.animation = 'none';
            nube.style.left = `${12 + indice * 30}%`;
        } else {
            nube.style.setProperty('--duracion', `${duracion}s`);
            nube.style.setProperty('--retraso', `${retraso}s`);
        }

        contenedor.appendChild(nube);
    });

    cielo.appendChild(contenedor);
}

// --- Noche: luna y estrellas --------------------------------------------

function crearNoche(cielo) {
    const contenedor = document.createElement('div');
    contenedor.className = 'cielo-noche';

    const luna = document.createElement('div');
    luna.className = 'jardin-luna';
    contenedor.appendChild(luna);

    for (let i = 0; i < 26; i++) {
        const estrella = document.createElement('div');
        estrella.className = 'jardin-estrella';
        const tam = 1 + Math.random() * 2;
        estrella.style.width = `${tam}px`;
        estrella.style.height = `${tam}px`;
        estrella.style.left = `${Math.random() * 96}%`;
        // Se deja el 30% inferior del cielo libre de estrellas: es donde
        // se recortan las colinas, y ahí quedarían tapadas de todos modos.
        estrella.style.top = `${Math.random() * 70}%`;
        estrella.style.setProperty('--duration', `${2 + Math.random() * 4}s`);
        estrella.style.setProperty('--delay', `${Math.random() * 5}s`);
        estrella.style.setProperty('--min-opacity', 0.25 + Math.random() * 0.3);
        estrella.style.setProperty('--max-opacity', 0.7 + Math.random() * 0.3);
        contenedor.appendChild(estrella);
    }

    cielo.appendChild(contenedor);
}

// --- Noche: luciérnagas sobre el pasto -----------------------------------

function crearLuciernagas(pasto) {
    // Igual que en el resto del sitio: con movimiento reducido, no se
    // generan. Un punto quieto sobre el pasto se leería como basura, no
    // como decoración.
    if (sinMovimiento) return;

    const contenedor = document.createElement('div');
    contenedor.className = 'jardin-luciernagas';

    for (let i = 0; i < 12; i++) {
        const luciernaga = document.createElement('div');
        luciernaga.className = 'jardin-luciernaga';
        luciernaga.style.left = `${Math.random() * 100}%`;
        luciernaga.style.top = `${10 + Math.random() * 80}%`;
        luciernaga.style.setProperty('--fly-duration', `${6 + Math.random() * 8}s`);
        luciernaga.style.setProperty('--fly-delay', `${Math.random() * 10}s`);
        luciernaga.style.setProperty('--fly-x', `${-120 + Math.random() * 240}px`);
        luciernaga.style.setProperty('--fly-y', `${-120 + Math.random() * 240}px`);
        contenedor.appendChild(luciernaga);
    }

    pasto.appendChild(contenedor);
}
