// Partículas, estrellas, luciérnagas y brillos. Puro adorno: no toca datos.

const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function crearParticulas() {
    if (sinMovimiento) return;
    const contenedor = document.getElementById('particles');
    if (!contenedor) return;

    // Estrellitas doradas hechas en CSS (la forma sale de .particle).
    const variantes = ['a', 'b', 'c'];

    for (let i = 0; i < 15; i++) {
        const particula = document.createElement('div');
        particula.className = `particle particle--${variantes[i % variantes.length]}`;
        particula.style.left = Math.random() * 100 + '%';
        particula.style.animationDelay = Math.random() * 15 + 's';
        particula.style.animationDuration = 15 + Math.random() * 10 + 's';
        contenedor.appendChild(particula);
    }
}

export function crearEstrellas() {
    const contenedor = document.createElement('div');
    contenedor.className = 'stars-container';
    contenedor.id = 'starsContainer';
    document.body.prepend(contenedor);

    for (let i = 0; i < 120; i++) {
        const estrella = document.createElement('div');
        estrella.className = 'star';
        const tam = 1 + Math.random() * 3;
        estrella.style.width = tam + 'px';
        estrella.style.height = tam + 'px';
        estrella.style.left = Math.random() * 100 + '%';
        estrella.style.top = Math.random() * 100 + '%';
        estrella.style.setProperty('--duration', 2 + Math.random() * 4 + 's');
        estrella.style.setProperty('--delay', Math.random() * 5 + 's');
        estrella.style.setProperty('--min-opacity', 0.2 + Math.random() * 0.3);
        estrella.style.setProperty('--max-opacity', 0.6 + Math.random() * 0.4);
        contenedor.appendChild(estrella);
    }

    if (sinMovimiento) return;

    for (let i = 0; i < 20; i++) {
        const luciernaga = document.createElement('div');
        luciernaga.className = 'firefly';
        luciernaga.style.left = Math.random() * 100 + '%';
        luciernaga.style.top = Math.random() * 100 + '%';
        luciernaga.style.setProperty('--fly-duration', 6 + Math.random() * 8 + 's');
        luciernaga.style.setProperty('--fly-delay', Math.random() * 10 + 's');
        luciernaga.style.setProperty('--fly-x', -200 + Math.random() * 400 + 'px');
        luciernaga.style.setProperty('--fly-y', -200 + Math.random() * 400 + 'px');
        contenedor.appendChild(luciernaga);
    }

    for (let i = 0; i < 5; i++) {
        const fugaz = document.createElement('div');
        fugaz.className = 'shooting-star';
        fugaz.style.left = Math.random() * 80 + '%';
        fugaz.style.top = Math.random() * 40 + '%';
        fugaz.style.setProperty('--shoot-duration', 3 + Math.random() * 4 + 's');
        fugaz.style.setProperty('--shoot-delay', Math.random() * 15 + 's');
        contenedor.appendChild(fugaz);
    }
}

export function explosionDeCorazones(x, y) {
    if (sinMovimiento) return;

    const cantidad = 8;

    for (let i = 0; i < cantidad; i++) {
        const corazon = document.createElement('div');
        corazon.className = 'corazon-burst';
        corazon.style.left = x + 'px';
        corazon.style.top = y + 'px';

        const angulo = ((Math.PI * 2) / cantidad) * i;
        const distancia = 80 + Math.random() * 60;

        document.body.appendChild(corazon);

        corazon.animate(
            [
                { transform: 'translate(-50%, -50%) scale(0) rotate(0deg)', opacity: 1 },
                {
                    transform: `translate(${Math.cos(angulo) * distancia}px, ${
                        Math.sin(angulo) * distancia
                    }px) scale(1.5) rotate(${Math.random() * 720}deg)`,
                    opacity: 0
                }
            ],
            { duration: 1200, easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)' }
        ).onfinish = () => corazon.remove();
    }
}

export function brilloEnTitulo() {
    if (sinMovimiento) return;
    const caja = document.querySelector('.stardew-title-box');
    if (!caja) return;

    setInterval(() => {
        const brillo = document.createElement('div');
        brillo.className = 'brillo-titulo';
        brillo.style.left = Math.random() * 100 + '%';
        brillo.style.top = Math.random() * 100 + '%';
        caja.appendChild(brillo);

        brillo.animate(
            [
                { opacity: 0, transform: 'scale(0) rotate(0deg)' },
                { opacity: 1, transform: 'scale(1.5) rotate(180deg)' },
                { opacity: 0, transform: 'scale(0) rotate(360deg)' }
            ],
            { duration: 2000, easing: 'ease-out' }
        ).onfinish = () => brillo.remove();
    }, 3000);
}

export function animarAlAparecer() {
    const tarjetas = document.querySelectorAll('.stardew-card');
    if (sinMovimiento) return;

    const observador = new IntersectionObserver(
        (entradas) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) {
                    entrada.target.style.opacity = '1';
                    entrada.target.style.transform = 'translateY(0)';
                }
            });
        },
        { threshold: 0.1 }
    );

    tarjetas.forEach((tarjeta) => {
        tarjeta.style.opacity = '0';
        tarjeta.style.transform = 'translateY(30px)';
        tarjeta.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observador.observe(tarjeta);
    });
}

// Lumos (claro) y Nox (oscuro). El sitio nace de noche: el modo oscuro es el
// predeterminado y solo se vuelve claro si la persona lo eligió.
const CLAVE_TEMA = 'tema-hogwarts';

export function setupModoOscuro() {
    const toggle = document.getElementById('darkToggle');
    if (!toggle) return;
    const icono = toggle.querySelector('.toggle-icon');

    function aplicar(oscuro) {
        document.body.classList.toggle('dark-mode', oscuro);
        // El ícono muestra a qué modo se va a pasar, no en cuál se está.
        icono.innerHTML = oscuro
            ? '<i class="fas fa-sun" aria-hidden="true"></i>'
            : '<i class="fas fa-moon" aria-hidden="true"></i>';
        const etiqueta = oscuro ? 'Lumos: pasar a modo claro' : 'Nox: pasar a modo oscuro';
        toggle.setAttribute('aria-label', etiqueta);
        toggle.title = etiqueta;
        document
            .querySelector('meta[name="theme-color"]')
            ?.setAttribute('content', oscuro ? '#0b0d1c' : '#3a2f63');
    }

    let guardado = null;
    try {
        guardado = localStorage.getItem(CLAVE_TEMA);
    } catch (e) {
        /* sin almacenamiento: se queda en Nox */
    }
    aplicar(guardado !== 'claro');

    toggle.addEventListener('click', () => {
        const oscuro = !document.body.classList.contains('dark-mode');
        aplicar(oscuro);
        try {
            localStorage.setItem(CLAVE_TEMA, oscuro ? 'oscuro' : 'claro');
        } catch (e) {
            /* sin almacenamiento: el cambio vale solo para esta visita */
        }
    });
}
