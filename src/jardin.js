// Entrada del jardín: la versión oficial del sitio (index.html).
// El sitio de scroll original queda preservado en clasico.html / main.js.

import './styles/base.css';
import './styles/coop.css';
import './styles/jardin.css';

import { setupAuth } from './lib/auth.js';
import { setupTimers } from './features/timers.js';
import { setupEventos } from './features/eventos.js';
import { setupGaleria } from './features/galeria.js';
import { setupTodos } from './features/todos.js';
import { setupCartas } from './features/cartas.js';
import { setupMusica } from './features/musica.js';
import { setupLightbox } from './features/lightbox.js';
import { setupModoOscuro } from './features/decorativo.js';
import { setupJardin } from './jardin/jardin.js';
import { setupIntroJardin } from './jardin/intro-jardin.js';
import { setupAmbiente } from './jardin/ambiente.js';
import { setupDecoracion } from './jardin/decoracion.js';
import { setupColinas } from './jardin/colinas.js';
import { inicializarPrimeraVez } from './jardin/novedades.js';
import { setupVisitas } from './jardin/visitas.js';
import { setupPresencia } from './lib/presencia.js';

async function iniciar() {
    // Nada de esto depende de la red: se pinta de inmediato.
    setupModoOscuro();
    setupTimers();
    setupLightbox();
    setupJardin();
    setupColinas();
    setupDecoracion();
    setupAmbiente();
    setupIntroJardin();

    // Antes de que lleguen los datos: si es la primera vez que este
    // navegador ve el sistema de novedades, marca todo lo existente como
    // "ya visto" para no prender las seis insignias de golpe.
    inicializarPrimeraVez();

    // La sesión primero: los módulos de datos consultan haySesion() al pintarse.
    await setupAuth();

    setupPresencia();
    // Después de la sesión también: registra la visita solo si hay login
    // y pinta las barras con el conteo compartido de la tabla visitas.
    setupVisitas();

    await Promise.all([
        setupGaleria(),
        setupEventos(),
        setupTodos(),
        setupCartas(),
        setupMusica()
    ]);
}

document.addEventListener('DOMContentLoaded', iniciar);
