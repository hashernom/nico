import './styles/base.css';
import './styles/flores.css';
import './styles/coop.css';

import { setupAuth } from './lib/auth.js';
import { setupIntro } from './features/intro.js';
import { setupTimers } from './features/timers.js';
import { setupEventos } from './features/eventos.js';
import { setupGaleria } from './features/galeria.js';
import { setupTodos } from './features/todos.js';
import { setupLightbox } from './features/lightbox.js';
import {
    crearParticulas,
    crearEstrellas,
    brilloEnTitulo,
    animarAlAparecer,
    setupModoOscuro
} from './features/decorativo.js';

async function iniciar() {
    // Nada de esto depende de la red: se pinta de inmediato.
    setupIntro();
    setupModoOscuro();
    crearEstrellas();
    crearParticulas();
    setupTimers();
    setupLightbox();
    brilloEnTitulo();
    animarAlAparecer();

    // La sesión primero: los módulos de datos consultan haySesion() al pintarse.
    await setupAuth();

    await Promise.all([setupGaleria(), setupEventos(), setupTodos()]);
}

document.addEventListener('DOMContentLoaded', iniciar);
