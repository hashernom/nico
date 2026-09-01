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

    // Presencia y visitas tampoco esperan a la sesión: los dos se suscriben
    // con alCambiarSesion(), que dispara de entrada con el estado actual y
    // de nuevo cuando la sesión resuelve. Presencia se re-anuncia con la
    // identidad correcta y visitas registra recién ahí (tiene su propio
    // flag para no contar dos veces).
    setupPresencia();
    setupVisitas();

    // Los datos son de lectura pública: no hace falta esperar a que resuelva
    // la sesión para pedirlos. Cada módulo ya se suscribe con
    // alCambiarSesion() y se vuelve a pintar solo cuando la sesión llega
    // (antes esta espera serializaba el camino crítico sin necesidad).
    await Promise.all([
        setupAuth(),
        setupGaleria(),
        setupEventos(),
        setupTodos(),
        setupCartas(),
        setupMusica()
    ]);
}

document.addEventListener('DOMContentLoaded', iniciar);
