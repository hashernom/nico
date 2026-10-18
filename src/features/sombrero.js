// ============================================================
//  EL SOMBRERO SELECCIONADOR
//  Un test de verdad: cada persona (con su sesión) responde 12 preguntas
//  más una final, el Sombrero va comentando, delibera y grita la casa.
//  El resultado se guarda por usuario (tabla `casas`) y, cuando las dos
//  personas ya fueron seleccionadas, se muestran juntas.
//
//  Nada del resultado de la otra persona se ve hasta que uno mismo se
//  selecciona: la sorpresa es parte de la dinámica.
// ============================================================

import { haySesion, alCambiarSesion, usuarioActual } from '../lib/auth.js';
import { NOMBRES } from '../lib/autores.js';
import {
    cargarCasas,
    casasActuales,
    alCambiarCasas,
    guardarCasa,
    reiniciarCasa,
    origenDeCasas
} from '../lib/casas.js';
import { suscribirEnVivo } from '../lib/vivo.js';
import { sonar } from '../lib/sonido.js';
import { CASAS, ID_CASAS, crearSombrero, crearEscudoIMG } from '../jardin/criaturas.js';
import {
    PREGUNTAS,
    PREGUNTA_FINAL,
    ABREV,
    COMENTARIOS,
    VEREDICTOS,
    DUDA,
    textoDePareja
} from './sombrero-datos.js';

const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const esperar = (ms) => new Promise((r) => setTimeout(r, sinMovimiento ? Math.min(ms, 60) : ms));

let raiz = null;
let ocupado = false; // hay un test en curso: no repintar por eventos externos
let escritura = 0; // token para cancelar una frase a medio escribir

// --- Utilidades ----------------------------------------------------------------

function el(tag, clase, texto) {
    const nodo = document.createElement(tag);
    if (clase) nodo.className = clase;
    if (texto !== undefined) nodo.textContent = texto;
    return nodo;
}

function mezclar(lista) {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

function nombreDe(uuid) {
    return NOMBRES[uuid] ?? 'tú';
}

/** Escribe `texto` letra por letra. Una llamada nueva cancela la anterior. */
async function escribir(nodo, texto, { ms = 22 } = {}) {
    const mio = ++escritura;
    nodo.textContent = '';
    if (sinMovimiento) {
        nodo.textContent = texto;
        return;
    }
    for (let i = 1; i <= texto.length; i++) {
        if (mio !== escritura) return;
        nodo.textContent = texto.slice(0, i);
        await esperar(ms);
    }
}

// --- Escena del Sombrero ----------------------------------------------------------------

/** Arma el sombrero con su globo de texto y devuelve sus partes. */
function montarSombrero() {
    const escena = el('div', 'sombrero-escena-hat');
    const sombrero = crearSombrero();
    const globo = el('div', 'sombrero-globo');
    const texto = el('p', 'sombrero-globo-texto');
    texto.setAttribute('aria-hidden', 'true');
    // Una región viva con el texto completo, para lectores de pantalla.
    const lector = el('p', 'solo-lector');
    lector.setAttribute('role', 'status');
    globo.append(texto, lector);
    escena.append(sombrero, globo);

    return {
        escena,
        sombrero,
        modo(nombre) {
            sombrero.dataset.modo = nombre; // idle | hablando | pensando | gritando
        },
        async decir(frase, opciones) {
            lector.textContent = frase;
            this.modo('hablando');
            await escribir(texto, frase, opciones);
            if (!ocupado || sombrero.dataset.modo === 'hablando') this.modo('idle');
        }
    };
}

function vaciar() {
    escritura += 1;
    raiz.replaceChildren();
}

// --- Pantallas --------------------------------------------------------------------------------

function render() {
    if (!raiz || ocupado) return;
    vaciar();

    if (!haySesion()) return pantallaBloqueada();
    const yo = usuarioActual();
    const casa = casasActuales()[yo];
    if (casa) return pantallaResultado(yo, casa);
    return pantallaInicio();
}

function estadoDeLosDemas() {
    // Sin revelar la casa: solo si ya pasó por el Sombrero.
    const casas = casasActuales();
    const yo = usuarioActual();
    return Object.entries(NOMBRES)
        .filter(([uuid]) => uuid !== yo)
        .map(([uuid, nombre]) => ({ nombre, listo: Boolean(casas[uuid]) }));
}

function pantallaBloqueada() {
    const hat = montarSombrero();
    hat.sombrero.dataset.modo = 'dormido';
    raiz.appendChild(hat.escena);

    hat.decir(
        'Mmm... no te reconozco. Solo hablo con quien sé quién es. Inicia sesión y conversamos.'
    );

    const boton = el('button', 'sombrero-boton', 'Iniciar sesión');
    boton.type = 'button';
    boton.addEventListener('click', () => document.getElementById('authBtn')?.click());
    raiz.appendChild(boton);
}

function pantallaInicio() {
    const hat = montarSombrero();
    raiz.appendChild(hat.escena);

    const info = el('p', 'sombrero-estado');
    const otros = estadoDeLosDemas();
    info.textContent = otros.length
        ? otros
              .map((o) => (o.listo ? `${o.nombre} ya pasó por el Sombrero.` : `${o.nombre} todavía no se pone el sombrero.`))
              .join(' ')
        : '';

    const boton = el('button', 'sombrero-boton', 'Ponerme el sombrero');
    boton.type = 'button';
    boton.addEventListener('click', () => {
        boton.disabled = true;
        iniciarTest();
    });
    raiz.append(info, boton);

    hat.decir(
        '¡Vaya! Una cabeza nueva. Ven, ven... Voy a hacerte unas preguntas y a escuchar lo que no dices. Responde con sinceridad: yo me doy cuenta.',
        { ms: 18 }
    );
}

// --- El test --------------------------------------------------------------------------------

async function iniciarTest() {
    ocupado = true;
    vaciar();
    sonar('abrir');

    const puntajes = { g: 0, s: 0, r: 0, h: 0 };
    const preguntas = mezclar(PREGUNTAS).map((p) => ({ ...p, respuestas: mezclar(p.respuestas) }));
    preguntas.push({ ...PREGUNTA_FINAL, respuestas: mezclar(PREGUNTA_FINAL.respuestas), final: true });

    const hat = montarSombrero();
    const velas = el('div', 'sombrero-velas');
    velas.setAttribute('role', 'progressbar');
    velas.setAttribute('aria-valuemin', '0');
    velas.setAttribute('aria-valuemax', String(preguntas.length));
    for (let i = 0; i < preguntas.length; i++) velas.appendChild(el('span', 'vela-mini'));
    const zona = el('div', 'sombrero-zona');
    raiz.append(hat.escena, velas, zona);

    let preferencia = null; // casa elegida en la pregunta final: desempata

    hat.decir('Empecemos. Responde sin pensarlo demasiado: lo primero que sientas es lo que cuenta.', { ms: 16 });

    for (let i = 0; i < preguntas.length; i++) {
        velas.setAttribute('aria-valuenow', String(i));
        const pregunta = preguntas[i];
        const eleccion = await preguntar(pregunta, i, preguntas.length, zona, hat, puntajes);
        for (const [abrev, peso] of Object.entries(eleccion.pesos)) puntajes[abrev] += peso;
        if (pregunta.final) preferencia = Object.keys(eleccion.pesos)[0];

        velas.children[i].classList.add('encendida');
        sonar('respuesta');

        if (!pregunta.final) {
            const lider = liderActual(puntajes, i);
            const lista = COMENTARIOS[lider] ?? COMENTARIOS.neutro;
            hat.decir(lista[i % lista.length], { ms: 16 });
            await esperar(900);
        }
    }
    velas.setAttribute('aria-valuenow', String(preguntas.length));

    await deliberar({ hat, zona, puntajes, preferencia });
}

/** Casa que va ganando; hasta que haya algo claro, el Sombrero no se compromete. */
function liderActual(puntajes, respondidas) {
    if (respondidas < 2) return 'neutro';
    const orden = Object.entries(puntajes).sort((a, b) => b[1] - a[1]);
    if (orden[0][1] - orden[1][1] < 2) return 'neutro';
    return ABREV[orden[0][0]];
}

function preguntar(pregunta, indice, total, zona, hat) {
    return new Promise((resolver) => {
        zona.replaceChildren();
        const caja = el('div', 'sombrero-pregunta');

        const num = el('p', 'sombrero-pregunta-num', pregunta.final ? 'Pregunta final' : `Pregunta ${indice + 1} de ${total - 1}`);
        const texto = el('h3', 'sombrero-pregunta-texto', pregunta.texto);
        const lista = el('div', 'sombrero-opciones');
        lista.setAttribute('role', 'group');
        lista.setAttribute('aria-label', 'Respuestas');

        pregunta.respuestas.forEach((respuesta, i) => {
            const boton = el('button', 'sombrero-opcion');
            boton.type = 'button';
            const letra = el('span', 'sombrero-opcion-letra', String.fromCharCode(65 + i));
            letra.setAttribute('aria-hidden', 'true');
            boton.append(letra, el('span', 'sombrero-opcion-texto', respuesta.texto));
            boton.addEventListener(
                'click',
                () => {
                    lista.querySelectorAll('button').forEach((b) => {
                        b.disabled = true;
                    });
                    boton.classList.add('elegida');
                    // Una pausa corta para que se vea qué se eligió.
                    setTimeout(() => resolver(respuesta), sinMovimiento ? 0 : 420);
                },
                { once: true }
            );
            lista.appendChild(boton);
        });

        caja.append(num, texto, lista);
        zona.appendChild(caja);
        sonar('pagina');
        if (indice > 0) caja.scrollIntoView({ block: 'nearest', behavior: sinMovimiento ? 'auto' : 'smooth' });
    });
}

// --- Deliberación y veredicto -------------------------------------------------------------------

async function deliberar({ hat, zona, puntajes, preferencia }) {
    zona.replaceChildren();
    const orden = Object.entries(puntajes).sort((a, b) => b[1] - a[1]);
    const duda = orden[0][1] - orden[1][1] <= 1.5;

    // Desempate: gana la preferencia propia entre las empatadas; si tampoco
    // alcanza, el Sombrero elige entre ellas al azar.
    const maximo = orden[0][1];
    let candidatas = orden.filter(([, v]) => v === maximo).map(([a]) => a);
    let ganadora = candidatas[0];
    if (candidatas.length > 1) {
        ganadora = candidatas.includes(preferencia)
            ? preferencia
            : candidatas[Math.floor(Math.random() * candidatas.length)];
    }
    const segunda = orden.find(([a]) => a !== ganadora)[0];

    hat.modo('pensando');
    const yo = usuarioActual();
    const nombre = nombreDe(yo);

    await hat.decir(duda ? DUDA.abre[Math.floor(Math.random() * DUDA.abre.length)] : 'Mmm... déjame pensar...', {
        ms: 24
    });
    hat.modo('pensando');
    if (duda) sonar('duda');
    await esperar(duda ? 3600 : 2200);

    if (duda) {
        await hat.decir(DUDA.cierra(ABREV[ganadora], CASAS[ABREV[segunda]].nombre, nombre), { ms: 20 });
        hat.modo('pensando');
        await esperar(1500);
    }

    await veredicto({ hat, zona, casa: ABREV[ganadora], puntajes, yo });
}

async function veredicto({ hat, zona, casa, puntajes, yo }) {
    const datos = CASAS[casa];
    const puntos = Object.fromEntries(Object.entries(puntajes).map(([a, v]) => [ABREV[a], v]));

    // Se guarda primero: si algo falla después, la selección ya quedó hecha.
    const destino = await guardarCasa(casa, puntos);

    hat.modo('gritando');
    sonar('veredicto');
    destello(datos);
    await hat.decir(VEREDICTOS[casa].grito, { ms: 55 });
    hat.modo('gritando');

    const grito = el('div', 'sombrero-grito');
    grito.style.setProperty('--casa', datos.color);
    grito.style.setProperty('--casa-texto', datos.texto);
    grito.appendChild(crearEscudoIMG(casa));
    grito.appendChild(el('p', 'sombrero-grito-nombre', datos.nombre));
    zona.replaceChildren(grito);
    confeti(grito, datos);

    await esperar(3200);
    ocupado = false;
    vaciar();
    pantallaResultado(yo, { casa, puntajes: puntos }, { recienSeleccionado: true, destino });
}

function destello(datos) {
    const flash = el('div', 'sombrero-destello');
    flash.style.background = datos.color;
    raiz.appendChild(flash);
    if (sinMovimiento) {
        setTimeout(() => flash.remove(), 100);
        return;
    }
    flash.animate([{ opacity: 0.85 }, { opacity: 0 }], { duration: 1100, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' })
        .onfinish = () => flash.remove();
}

function confeti(origen, datos) {
    if (sinMovimiento) return;
    const rect = origen.getBoundingClientRect();
    const colores = [datos.color, datos.acento, datos.texto];
    const cantidad = 26;
    for (let i = 0; i < cantidad; i++) {
        const chispa = el('div', 'sombrero-chispa');
        chispa.style.background = colores[i % colores.length];
        chispa.style.left = `${rect.left + rect.width / 2}px`;
        chispa.style.top = `${rect.top + rect.height / 3}px`;
        document.body.appendChild(chispa);

        const angulo = (Math.PI * 2 * i) / cantidad + Math.random() * 0.4;
        const distancia = 90 + Math.random() * 150;
        chispa.animate(
            [
                { transform: 'translate(-50%, -50%) scale(0.2) rotate(0deg)', opacity: 1 },
                {
                    transform: `translate(${Math.cos(angulo) * distancia}px, ${Math.sin(angulo) * distancia + 40}px) scale(${0.8 + Math.random()}) rotate(${Math.random() * 360}deg)`,
                    opacity: 0
                }
            ],
            { duration: 1500 + Math.random() * 600, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
        ).onfinish = () => chispa.remove();
    }
}

// --- Resultado ----------------------------------------------------------------------------------

function pantallaResultado(uuid, { casa, puntajes }, { recienSeleccionado = false, destino = 'nube' } = {}) {
    const datos = CASAS[casa];
    const nombre = nombreDe(uuid);

    const banner = el('article', 'sombrero-banner');
    banner.style.setProperty('--casa', datos.color);
    banner.style.setProperty('--casa-oscuro', datos.colorOscuro);
    banner.style.setProperty('--casa-acento', datos.acento);
    banner.style.setProperty('--casa-texto', datos.texto);
    banner.dataset.casa = casa;

    const cabecera = el('div', 'sombrero-banner-cabecera');
    cabecera.append(crearEscudoIMG(casa));
    const titulos = el('div', 'sombrero-banner-titulos');
    titulos.append(el('p', 'sombrero-banner-quien', `${nombre} pertenece a`), el('h3', 'sombrero-banner-casa', datos.nombre));
    titulos.append(el('p', 'sombrero-banner-virtudes', datos.virtudes));
    cabecera.appendChild(titulos);

    const explicacion = el('p', 'sombrero-explicacion', VEREDICTOS[casa].explicacion(nombre));

    const total = ID_CASAS.reduce((suma, c) => suma + (puntajes?.[c] ?? 0), 0) || 1;
    const barras = el('div', 'sombrero-barras');
    barras.setAttribute('role', 'list');
    barras.appendChild(el('p', 'sombrero-barras-titulo', 'Así lo pensó el Sombrero'));
    ID_CASAS.forEach((c) => {
        const porcentaje = Math.round(((puntajes?.[c] ?? 0) / total) * 100);
        const fila = el('div', 'sombrero-barra');
        fila.setAttribute('role', 'listitem');
        fila.style.setProperty('--c', CASAS[c].color);
        fila.style.setProperty('--c2', CASAS[c].acento);
        const rotulo = el('span', 'sombrero-barra-nombre', CASAS[c].nombre);
        const pista = el('span', 'sombrero-barra-pista');
        const relleno = el('span', 'sombrero-barra-relleno');
        relleno.style.setProperty('--ancho', `${porcentaje}%`);
        pista.appendChild(relleno);
        const valor = el('span', 'sombrero-barra-valor', `${porcentaje}%`);
        fila.append(rotulo, pista, valor);
        barras.appendChild(fila);
    });

    banner.append(cabecera, explicacion, barras);
    if (recienSeleccionado) banner.classList.add('recien');
    raiz.appendChild(banner);

    if (destino === 'local' || origenDeCasas() === 'local') {
        raiz.appendChild(
            el('p', 'sombrero-aviso', 'Tu casa quedó guardada solo en este dispositivo: la base de datos todavía no tiene la tabla de casas, así que la otra persona aún no puede verla.')
        );
    }

    raiz.appendChild(comparacion(uuid));
    raiz.appendChild(reinicio());
}

function comparacion(yo) {
    const caja = el('section', 'sombrero-comparacion');
    const casas = casasActuales();
    const uuids = Object.keys(NOMBRES);
    const listos = uuids.filter((u) => casas[u]);

    caja.appendChild(el('h4', 'sombrero-comparacion-titulo', 'Las casas de los dos'));

    if (listos.length < uuids.length) {
        const falta = uuids.filter((u) => !casas[u] && u !== yo).map(nombreDe);
        caja.appendChild(
            el('p', 'sombrero-comparacion-espera', falta.length
                ? `Falta que ${falta.join(' y ')} se ponga el sombrero. Cuando lo haga, aquí aparecen las dos casas juntas.`
                : 'Falta que los dos se pongan el sombrero.')
        );
        return caja;
    }

    const fila = el('div', 'sombrero-comparacion-fila');
    uuids.forEach((uuid) => {
        const casa = casas[uuid].casa;
        const dato = CASAS[casa];
        const tarjeta = el('div', 'sombrero-tarjeta');
        tarjeta.style.setProperty('--casa', dato.color);
        tarjeta.style.setProperty('--casa-texto', dato.texto);
        tarjeta.append(crearEscudoIMG(casa), el('p', 'sombrero-tarjeta-nombre', nombreDe(uuid)), el('p', 'sombrero-tarjeta-casa', dato.nombre));
        fila.appendChild(tarjeta);
    });
    caja.appendChild(fila);

    const [a, b] = uuids;
    caja.appendChild(el('p', 'sombrero-comparacion-texto', textoDePareja(casas[a].casa, casas[b].casa)));
    return caja;
}

function reinicio() {
    const caja = el('div', 'sombrero-reinicio');
    const boton = el('button', 'sombrero-enlace', 'Reiniciar mi selección');
    boton.type = 'button';
    boton.addEventListener('click', () => {
        caja.replaceChildren();
        caja.appendChild(el('p', 'sombrero-reinicio-aviso', 'El Sombrero olvidará tu casa y tendrás que hacer el test de nuevo. ¿Seguro?'));
        const si = el('button', 'sombrero-boton sombrero-boton--chico', 'Sí, reiniciar');
        si.type = 'button';
        si.addEventListener('click', async () => {
            si.disabled = true;
            await reiniciarCasa();
            render();
        });
        const no = el('button', 'sombrero-enlace', 'Cancelar');
        no.type = 'button';
        no.addEventListener('click', () => {
            caja.replaceChildren(boton);
        });
        caja.append(si, no);
    });
    caja.appendChild(boton);
    return caja;
}

// --- Arranque ---------------------------------------------------------------------------------------

export function setupSombrero() {
    // La sección no está en el HTML: se crea acá, así mientras el sombrero
    // esté oculto no hay rastro de él en la página (ver src/config.js).
    const cuerpo = document.getElementById('panelCuerpo');
    if (!cuerpo) return;
    const seccion = document.createElement('section');
    seccion.className = 'seccion';
    seccion.dataset.seccion = 'sombrero';
    seccion.hidden = true;
    raiz = document.createElement('div');
    raiz.className = 'sombrero-escena';
    raiz.id = 'sombreroEscena';
    seccion.appendChild(raiz);
    cuerpo.appendChild(seccion);

    cargarCasas();
    suscribirEnVivo('casas', cargarCasas);

    // Se repinta cuando cambia la sesión o llegan casas nuevas, pero nunca
    // en medio de un test.
    alCambiarSesion(() => {
        cargarCasas();
        render();
    });
    alCambiarCasas(() => render());

    document.addEventListener('seccion-abierta', (e) => {
        if (e.detail?.id === 'sombrero' && !ocupado) render();
    });
}
