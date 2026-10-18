// Pantalla de bienvenida: la carta se cierra al primer click y revela el sitio.

const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function setupIntro() {
    const flores = document.querySelector('.carta-bienvenida');
    const principal = document.querySelector('.main-container');
    const particulas = document.getElementById('particles');

    if (!flores) return;

    function revelar() {
        flores.classList.add('hidden');

        // Se conserva "initial-hidden": son las reglas .initial-hidden.show
        // las que aplican la transición de entrada.
        principal?.classList.add('show');
        particulas?.classList.add('show');

        setTimeout(() => {
            flores.style.display = 'none';
        }, 500);
    }

    // Con animaciones reducidas la intro no aporta: se salta directo.
    if (sinMovimiento) {
        revelar();
        return;
    }

    flores.addEventListener('click', revelar, { once: true });
    flores.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            revelar();
        }
    });
    flores.focus({ preventScroll: true });
}
