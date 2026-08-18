// Pantalla de bienvenida: las flores se ocultan al primer click y revelan el sitio.

const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function setupIntro() {
    const flores = document.querySelector('.flower-animation');
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
    flores.style.cursor = 'pointer';
    flores.title = 'Haz click para continuar';
}
