// ============================================================
//  VISITAS DEL MES / COPA DE LAS CASAS
//  Dos barras pixel art (Santi y Nico), estilo barra de vida de
//  videojuego: cuántas veces entró cada uno este mes. Cuando una persona ya
//  pasó por el Sombrero Seleccionador, su barra lleva el escudo y los colores
//  de su casa y cada visita es un punto: es la copa de las casas. El contador es
//  COMPARTIDO: se guarda en la tabla `visitas` de Supabase con la
//  identidad de la sesión (created_by, default auth.uid()), así cada
//  uno ve el ritmo del otro, no solo el propio.
//
//  Solo cuenta visitas con sesión iniciada (decisión con el usuario):
//  ver el jardín sigue sin requerir login — quien mira sin sesión ve
//  las barras pero no las suma. Una visita por carga de página; si
//  alguien se loguea a mitad de visita, esa carga también cuenta.
// ============================================================

import { supabase } from '../lib/supabase.js';
import { alCambiarSesion } from '../lib/auth.js';
import { NOMBRES } from '../lib/autores.js';
import { alCambiarCasas, casasActuales } from '../lib/casas.js';
import { CASAS, crearEscudoIMG } from './criaturas.js';

const TOPE = 30; // techo VISUAL para que la barra tenga sentido; no es un límite real
const SEGMENTOS = 8;
const MESES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

// Una sola visita por carga de página: alCambiarSesion dispara varias
// veces al arrancar (estado inicial + evento INITIAL_SESSION) y esto
// evita insertar de más.
let registrada = false;

// uuid -> { barra, nombre, fila, etiqueta, puntos } para pintar sin reconstruir el DOM.
const barras = new Map();
let conteoActual = {};
let widgetEl = null;

function inicioDelMes() {
    const ahora = new Date();
    return new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString();
}

export function setupVisitas() {
    const contenedor = document.getElementById('widgetsIzquierda');
    if (!contenedor) return;

    const widget = document.createElement('div');
    widget.className = 'visitas-widget';
    widget.setAttribute('role', 'group');
    widget.setAttribute(
        'aria-label',
        `Visitas al jardín en ${MESES[new Date().getMonth()]}`
    );
    widget.title = widget.getAttribute('aria-label');

    for (const [uuid, nombre] of Object.entries(NOMBRES)) {
        const fila = document.createElement('div');
        fila.className = `visitas-fila visitas-fila--${nombre.toLowerCase()}`;

        const escudo = document.createElement('span');
        escudo.className = 'visitas-escudo';
        escudo.setAttribute('aria-hidden', 'true');

        const etiqueta = document.createElement('span');
        etiqueta.className = 'visitas-nombre';
        etiqueta.textContent = nombre;

        const barra = document.createElement('div');
        barra.className = 'visitas-barra';
        barra.setAttribute('role', 'img');

        for (let i = 0; i < SEGMENTOS; i++) {
            barra.appendChild(document.createElement('span')).className =
                'visitas-segmento';
        }

        const puntos = document.createElement('span');
        puntos.className = 'visitas-puntos';
        puntos.hidden = true;

        fila.append(escudo, etiqueta, barra, puntos);
        widget.appendChild(fila);
        barras.set(uuid, { barra, nombre, fila, escudo, etiqueta, puntos });
    }

    widgetEl = widget;
    contenedor.appendChild(widget);

    // Las casas pueden llegar antes o después de las visitas.
    alCambiarCasas(() => pintarCasas());

    alCambiarSesion(async (sesion) => {
        if (sesion && !registrada) {
            registrada = true;
            // created_by va explícito para no depender del default:
            // es el mismo uuid que pondría auth.uid().
            const { error } = await supabase
                .from('visitas')
                .insert({ created_by: sesion.user.id });
            if (error) {
                console.error('No se pudo registrar la visita:', error.message);
            }
        }
        actualizar();
    });
}

async function actualizar() {
    const { data, error } = await supabase
        .from('visitas')
        .select('created_by')
        .gte('created_at', inicioDelMes());
    if (error) {
        console.error('No se pudieron leer las visitas:', error.message);
        return;
    }

    const conteo = {};
    for (const fila of data) {
        conteo[fila.created_by] = (conteo[fila.created_by] || 0) + 1;
    }

    conteoActual = conteo;
    const mes = MESES[new Date().getMonth()];
    for (const [uuid, { barra, nombre }] of barras) {
        const cantidad = conteo[uuid] || 0;
        // 0 visitas = barra vacía (honesto). A partir de la primera visita
        // se pinta al menos un segmento.
        const llenos = cantidad === 0
            ? 0
            : Math.max(1, Math.round((cantidad / TOPE) * SEGMENTOS));

        barra.querySelectorAll('.visitas-segmento').forEach((segmento, i) => {
            segmento.classList.toggle('lleno', i < llenos);
        });

        // El gráfico es decorativo, pero el número real tiene que ser
        // accesible a lectores de pantalla.
        barra.setAttribute(
            'aria-label',
            `${nombre} entró ${cantidad} ${cantidad === 1 ? 'vez' : 'veces'} en ${mes}`
        );
    }

    pintarCasas();
}

// La copa: escudo y color de casa en cada barra, y una corona para quien va
// adelante cuando las dos personas ya tienen casa.
function pintarCasas() {
    if (!widgetEl) return;
    const casas = casasActuales();

    const conCasa = [...barras.keys()].filter((uuid) => casas[uuid]);
    widgetEl.classList.toggle('visitas-widget--copa', conCasa.length > 0);

    const cantidades = [...barras.keys()].map((uuid) => conteoActual[uuid] || 0);
    const hayLider = conCasa.length === barras.size && cantidades[0] !== cantidades[1];
    const lider = hayLider
        ? [...barras.keys()][cantidades[0] > cantidades[1] ? 0 : 1]
        : null;

    for (const [uuid, { fila, escudo, etiqueta, puntos, nombre }] of barras) {
        const casa = casas[uuid]?.casa;
        fila.dataset.casa = casa ?? '';
        escudo.replaceChildren();

        if (casa) {
            escudo.appendChild(crearEscudoIMG(casa));
            fila.title = `${nombre}: ${CASAS[casa].nombre}`;
        } else {
            fila.removeAttribute('title');
        }

        const cantidad = conteoActual[uuid] || 0;
        puntos.hidden = !casa;
        puntos.textContent = String(cantidad);
        puntos.setAttribute('aria-label', `${cantidad} ${cantidad === 1 ? 'punto' : 'puntos'}`);

        etiqueta.textContent = nombre;
        if (uuid === lider) {
            const corona = document.createElement('i');
            corona.className = 'fas fa-crown visitas-corona';
            corona.setAttribute('role', 'img');
            corona.setAttribute('aria-label', 'va ganando la copa');
            etiqueta.append(' ', corona);
        }
    }
}
