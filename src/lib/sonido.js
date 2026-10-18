// ============================================================
//  SONIDO (opcional)
//  Música ambiente y efectos generados con WebAudio: sin archivos de
//  audio y sin melodías de ninguna película. Es una cama suave de
//  acordes con notas de celesta al azar, más unos pocos efectos.
//
//  Empieza APAGADO. Los navegadores solo dejan sonar tras un gesto de la
//  persona, así que el botón es el que lo enciende; si quedó encendido
//  de una visita anterior, arranca en el primer toque.
// ============================================================

const CLAVE = 'sonido-hogwarts';

let ctx = null;
let maestro = null;
let reverb = null;
let musica = null; // { intervalo, proximoAcorde, indice }
let encendido = false;
const suscriptores = new Set();

// Do menor dórico flotante: acordes lentos con notas de celesta encima.
const ACORDES = [
    [146.83, 174.61, 220.0], // Re menor
    [116.54, 146.83, 174.61], // Si bemol
    [98.0, 116.54, 146.83], // Sol menor
    [110.0, 138.59, 164.81] // La
];
const NOTAS_CELESTA = [293.66, 349.23, 392.0, 440.0, 523.25, 587.33, 698.46, 783.99];

function leer() {
    try {
        return localStorage.getItem(CLAVE) === 'on';
    } catch (e) {
        return false;
    }
}

function guardar(valor) {
    try {
        localStorage.setItem(CLAVE, valor ? 'on' : 'off');
    } catch (e) {
        /* sin almacenamiento */
    }
}

export function sonidoActivo() {
    return encendido;
}

export function alCambiarSonido(cb) {
    suscriptores.add(cb);
    cb(encendido);
    return () => suscriptores.delete(cb);
}

function avisar() {
    suscriptores.forEach((cb) => cb(encendido));
}

// --- Contexto de audio ------------------------------------------------------

function asegurarContexto() {
    if (ctx) return ctx;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;

    ctx = new Ctor();
    maestro = ctx.createGain();
    maestro.gain.value = 0.55;
    maestro.connect(ctx.destination);

    // Reverb con una respuesta al impulso generada: ruido que se apaga.
    reverb = ctx.createConvolver();
    const largo = Math.floor(ctx.sampleRate * 2.6);
    const impulso = ctx.createBuffer(2, largo, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
        const datos = impulso.getChannelData(c);
        for (let i = 0; i < largo; i++) {
            datos[i] = (Math.random() * 2 - 1) * (1 - i / largo) ** 2.6;
        }
    }
    reverb.buffer = impulso;
    const mojado = ctx.createGain();
    mojado.gain.value = 0.5;
    reverb.connect(mojado);
    mojado.connect(maestro);

    document.addEventListener('visibilitychange', () => {
        if (!ctx) return;
        if (document.hidden) ctx.suspend();
        else if (encendido) ctx.resume();
    });
    return ctx;
}

// Un tono con ataque y caída exponencial; `ruta` decide si pasa por el reverb.
function tono({ frec, inicio = 0, dur = 1, vol = 0.1, tipo = 'sine', ataque = 0.01, conReverb = true, armonico = 0 }) {
    if (!ctx) return;
    const t0 = ctx.currentTime + inicio;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + ataque);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    gain.connect(maestro);
    if (conReverb) gain.connect(reverb);

    const voces = [[frec, 1]];
    if (armonico) voces.push([frec * 2, armonico]);
    voces.forEach(([f, peso]) => {
        const osc = ctx.createOscillator();
        osc.type = tipo;
        osc.frequency.value = f;
        const g = ctx.createGain();
        g.gain.value = peso;
        osc.connect(g).connect(gain);
        osc.start(t0);
        osc.stop(t0 + dur + 0.1);
    });
}

function ruido({ inicio = 0, dur = 0.3, vol = 0.1, desde = 2000, hasta = 400 }) {
    if (!ctx) return;
    const t0 = ctx.currentTime + inicio;
    const largo = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, largo, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < largo; i++) d[i] = Math.random() * 2 - 1;

    const fuente = ctx.createBufferSource();
    fuente.buffer = buf;
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'bandpass';
    filtro.frequency.setValueAtTime(desde, t0);
    filtro.frequency.exponentialRampToValueAtTime(hasta, t0 + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    fuente.connect(filtro).connect(gain).connect(maestro);
    fuente.start(t0);
}

// --- Música ambiente -----------------------------------------------------------------

function acorde(indice) {
    const notas = ACORDES[indice % ACORDES.length];
    const dur = 9;
    notas.forEach((f, i) => {
        const t0 = ctx.currentTime;
        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 800;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(0.045, t0 + 2.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + 2);
        lowpass.connect(gain);
        gain.connect(maestro);
        gain.connect(reverb);

        [-4, 4].forEach((detune) => {
            const osc = ctx.createOscillator();
            osc.type = i === 0 ? 'triangle' : 'sine';
            osc.frequency.value = f;
            osc.detune.value = detune;
            osc.connect(lowpass);
            osc.start(t0);
            osc.stop(t0 + dur + 2.2);
        });
    });
}

function celesta() {
    const f = NOTAS_CELESTA[Math.floor(Math.random() * NOTAS_CELESTA.length)];
    tono({ frec: f, dur: 2.2, vol: 0.05, tipo: 'sine', ataque: 0.008, armonico: 0.35 });
}

function arrancarMusica() {
    if (musica || !ctx) return;
    let indice = 0;
    let proximaNota = 0;
    acorde(indice);
    let proximoAcorde = ctx.currentTime + 8;

    musica = {
        intervalo: setInterval(() => {
            if (!ctx || ctx.state !== 'running') return;
            const ahora = ctx.currentTime;
            if (ahora >= proximoAcorde) {
                indice += 1;
                acorde(indice);
                proximoAcorde = ahora + 8;
            }
            if (ahora >= proximaNota) {
                celesta();
                proximaNota = ahora + 1.1 + Math.random() * 2.6;
            }
        }, 300)
    };
}

function detenerMusica() {
    if (!musica) return;
    clearInterval(musica.intervalo);
    musica = null;
}

// --- Efectos --------------------------------------------------------------------------

const EFECTOS = {
    abrir() {
        tono({ frec: 880, dur: 0.9, vol: 0.07, armonico: 0.4 });
        tono({ frec: 1318.5, inicio: 0.09, dur: 1.1, vol: 0.06, armonico: 0.4 });
    },
    cerrar() {
        tono({ frec: 1318.5, dur: 0.6, vol: 0.05, armonico: 0.3 });
        tono({ frec: 880, inicio: 0.09, dur: 0.8, vol: 0.05, armonico: 0.3 });
    },
    respuesta() {
        tono({ frec: 587.33, dur: 0.6, vol: 0.06, armonico: 0.3 });
    },
    sello() {
        ruido({ dur: 0.18, vol: 0.18, desde: 3200, hasta: 600 });
        tono({ frec: 110, dur: 0.4, vol: 0.12, tipo: 'triangle', conReverb: false });
    },
    pagina() {
        ruido({ dur: 0.22, vol: 0.05, desde: 2600, hasta: 900 });
    },
    lechuza() {
        ruido({ dur: 1.4, vol: 0.05, desde: 500, hasta: 1800 });
        tono({ frec: 330, inicio: 0.9, dur: 0.5, vol: 0.05, tipo: 'sine', conReverb: false });
        tono({ frec: 294, inicio: 1.25, dur: 0.6, vol: 0.05, tipo: 'sine', conReverb: false });
    },
    duda() {
        tono({ frec: 220, dur: 1.4, vol: 0.05, tipo: 'triangle' });
        tono({ frec: 233, inicio: 0.4, dur: 1.4, vol: 0.04, tipo: 'triangle' });
    },
    veredicto() {
        // Un arpegio ascendente y un acorde final largo.
        [293.66, 349.23, 440, 587.33, 698.46, 880].forEach((f, i) =>
            tono({ frec: f, inicio: i * 0.11, dur: 1.4, vol: 0.07, tipo: 'triangle', armonico: 0.4 })
        );
        [293.66, 440, 587.33, 698.46].forEach((f) =>
            tono({ frec: f, inicio: 0.8, dur: 3.2, vol: 0.05, tipo: 'sine', ataque: 0.15, armonico: 0.3 })
        );
    }
};

/** Reproduce un efecto si el sonido está encendido. */
export function sonar(nombre) {
    if (!encendido || !ctx || ctx.state !== 'running') return;
    EFECTOS[nombre]?.();
}

// --- Encendido y botón -------------------------------------------------------------------

export async function activarSonido(valor) {
    encendido = valor;
    guardar(valor);

    if (valor) {
        if (!asegurarContexto()) {
            encendido = false;
            avisar();
            return;
        }
        await ctx.resume();
        arrancarMusica();
        EFECTOS.abrir();
    } else {
        detenerMusica();
    }
    avisar();
}

export function setupSonido() {
    const boton = document.getElementById('sonidoBtn');
    if (!boton) return;

    function pintar(activo) {
        boton.innerHTML = activo
            ? '<i class="fas fa-volume-high" aria-hidden="true"></i>'
            : '<i class="fas fa-volume-xmark" aria-hidden="true"></i>';
        boton.setAttribute('aria-pressed', String(activo));
        const etiqueta = activo ? 'Silenciar la música' : 'Activar música y sonidos';
        boton.setAttribute('aria-label', etiqueta);
        boton.title = etiqueta;
    }

    alCambiarSonido(pintar);
    boton.addEventListener('click', () => activarSonido(!encendido));

    // Si estaba encendido en la visita anterior, arranca con el primer toque.
    if (leer()) {
        const alPrimerToque = (e) => {
            // Si el primer toque es el propio botón, su click ya se encarga.
            if (e.target.closest?.('#sonidoBtn')) return;
            activarSonido(true);
        };
        document.addEventListener('pointerdown', alPrimerToque, { once: true });
    }
}
