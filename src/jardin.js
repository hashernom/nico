// Entrada del jardín (Fase 2).
// El sitio de scroll sigue vivo en index.html / main.js mientras esto se arma.

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

async function iniciar() {
    // Nada de esto depende de la red: se pinta de inmediato.
    setupModoOscuro();
    setupTimers();
    setupLightbox();
    setupJardin();
    setupAmbiente();
    setupIntroJardin();

    // La sesión primero: los módulos de datos consultan haySesion() al pintarse.
    await setupAuth();

    await Promise.all([
        setupGaleria(),
        setupEventos(),
        setupTodos(),
        setupCartas(),
        setupMusica()
    ]);
}

document.addEventListener('DOMContentLoaded', iniciar);
