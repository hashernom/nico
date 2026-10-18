// ============================================================
//  RETRATOS QUE SE MUEVEN (sección Galería)
//  Como los cuadros de un castillo: cada tanto una de las fotos que se
//  ven cobra vida un instante (un leve vaivén de la imagen dentro de su
//  marco) y también al pasar el cursor o tocarla. Es solo CSS sobre la
//  clase `.viva`; acá solo se decide cuándo.
// ============================================================

const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const DURACION_MS = 3200;

export function setupRetratos() {
    const grid = document.getElementById('gallery-grid');
    const cuerpo = document.getElementById('panelCuerpo');
    if (!grid || !cuerpo || sinMovimiento) return;

    let intervalo = null;

    function animar(foto) {
        if (foto.classList.contains('viva')) return;
        foto.classList.add('viva');
        setTimeout(() => foto.classList.remove('viva'), DURACION_MS);
    }

    function elegirVisible() {
        const zona = cuerpo.getBoundingClientRect();
        const visibles = [...grid.querySelectorAll('.album-photo')].filter((foto) => {
            const r = foto.getBoundingClientRect();
            return r.bottom > zona.top + 20 && r.top < zona.bottom - 20;
        });
        if (visibles.length) animar(visibles[Math.floor(Math.random() * visibles.length)]);
    }

    // Al pasar el cursor o tocar, esa foto también se anima.
    grid.addEventListener('pointerover', (e) => {
        const foto = e.target.closest?.('.album-photo');
        if (foto) animar(foto);
    });

    document.addEventListener('seccion-abierta', (e) => {
        clearInterval(intervalo);
        if (e.detail?.id !== 'galeria') return;
        setTimeout(elegirVisible, 700);
        intervalo = setInterval(elegirVisible, 2400);
    });

    document.addEventListener('seccion-cerrada', () => clearInterval(intervalo));
}
