import { supabase } from '../lib/supabase.js';
import { haySesion, alCambiarSesion, usuarioActual } from '../lib/auth.js';
import { etiquetaAutor } from '../lib/autores.js';
import { avisarSiHayNovedad, masReciente } from '../jardin/novedades.js';
import { conReintentos, suscribirEnVivo, pintarError } from '../lib/vivo.js';

// Cartas: notas con fecha que se escriben entre ellos.
// Cada una es un sobre cerrado; al tocarlo se abre y despliega la hoja.

let cartas = [];

export async function setupCartas() {
    const lista = document.getElementById('cartasLista');
    const form = document.getElementById('cartaForm');
    const inputTexto = document.getElementById('cartaTexto');
    const inputFecha = document.getElementById('cartaFecha');
    const estado = document.getElementById('cartaEstado');

    if (!lista) return;

    async function cargar() {
        const { data, error } = await conReintentos(() =>
            supabase
                .from('letters')
                .select('*')
                .order('written_on', { ascending: false, nullsFirst: false })
                .order('created_at', { ascending: false })
        );

        if (error) {
            console.error('Error cargando cartas:', error.message);
            pintarError(lista, 'No se pudieron cargar las cartas 😢', cargar);
            return;
        }
        cartas = data;
        pintar();
        avisarSiHayNovedad('cartas', masReciente(cartas));
    }

    // Mismo orden que la consulta: fecha descendente, sin fecha al final.
    function ordenar(items) {
        return [...items].sort((a, b) => {
            if (!a.written_on) return 1;
            if (!b.written_on) return -1;
            return b.written_on.localeCompare(a.written_on);
        });
    }

    function pintar() {
        lista.innerHTML = '';

        if (cartas.length === 0) {
            const vacio = document.createElement('p');
            vacio.className = 'galeria-vacia';
            vacio.textContent = haySesion()
                ? 'Todavía no hay cartas. Escribí la primera 💌'
                : 'Todavía no hay cartas.';
            lista.appendChild(vacio);
            return;
        }

        cartas.forEach((carta, indice) => {
            lista.appendChild(construirSobre(carta, indice));
        });
    }

    function construirSobre(carta, indice) {
        const sobre = document.createElement('article');
        sobre.className = 'sobre';
        sobre.style.setProperty('--orden', indice);

        const solapa = document.createElement('button');
        solapa.type = 'button';
        solapa.className = 'sobre-frente';
        solapa.setAttribute('aria-expanded', 'false');

        const sello = document.createElement('span');
        sello.className = 'sobre-sello';
        sello.textContent = '💗';
        sello.setAttribute('aria-hidden', 'true');

        const fecha = document.createElement('span');
        fecha.className = 'sobre-fecha';
        fecha.textContent = formatearFecha(carta.written_on);
        fecha.appendChild(etiquetaAutor(carta.created_by));

        const pista = document.createElement('span');
        pista.className = 'sobre-pista';
        pista.textContent = 'abrir';

        solapa.append(sello, fecha, pista);

        const hoja = document.createElement('div');
        hoja.className = 'sobre-hoja';
        hoja.hidden = true;

        const texto = document.createElement('p');
        texto.className = 'sobre-texto';
        texto.textContent = carta.body; // textContent: sin riesgo de HTML inyectado
        hoja.appendChild(texto);

        if (haySesion()) {
            const borrar = document.createElement('button');
            borrar.className = 'evento-borrar';
            borrar.innerHTML = '<i class="fas fa-trash-alt"></i>';
            borrar.setAttribute('aria-label', 'Borrar carta');
            borrar.addEventListener('click', () => eliminar(carta));
            hoja.appendChild(borrar);
        }

        solapa.addEventListener('click', () => {
            const abierto = sobre.classList.toggle('abierto');
            solapa.setAttribute('aria-expanded', String(abierto));
            hoja.hidden = !abierto;
            pista.textContent = abierto ? 'cerrar' : 'abrir';
        });

        sobre.append(solapa, hoja);
        return sobre;
    }

    async function eliminar(carta) {
        if (!haySesion()) return;

        const previas = cartas;
        cartas = cartas.filter((c) => c.id !== carta.id);
        pintar();

        const { error } = await supabase.from('letters').delete().eq('id', carta.id);
        if (error) {
            console.error('Error borrando carta:', error.message);
            cartas = previas;
            pintar();
        }
    }

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!haySesion()) return;

        const body = inputTexto.value.trim();
        if (!body) return;
        const written_on = inputFecha.value || null;

        const boton = form.querySelector('button[type="submit"]');
        boton.disabled = true;
        form.reset();

        const temporal = {
            id: `temp-${Date.now()}`,
            body,
            written_on,
            created_by: usuarioActual(),
            _optimista: true
        };
        cartas = ordenar([...cartas, temporal]);
        pintar();

        const { data, error } = await supabase
            .from('letters')
            .insert({ body, written_on })
            .select()
            .single();

        boton.disabled = false;

        if (error) {
            estado.textContent = `Error: ${error.message}`;
            console.error('Error agregando carta:', error.message);
            cartas = cartas.filter((c) => c.id !== temporal.id);
            pintar();
            return;
        }

        cartas = ordenar(cartas.map((c) => (c.id === temporal.id ? data : c)));
        pintar();
        estado.textContent = '¡Carta guardada! 💌';
        setTimeout(() => {
            estado.textContent = '';
        }, 3000);
    });

    alCambiarSesion(() => {
        form?.classList.toggle('oculto', !haySesion());
        pintar();
    });

    await cargar();

    suscribirEnVivo('letters', cargar);
}

function formatearFecha(iso) {
    if (!iso) return 'sin fecha';
    // La fecha viene como YYYY-MM-DD: partirla a mano evita que el navegador
    // la interprete como UTC y muestre el día anterior.
    const [anio, mes, dia] = iso.split('-').map(Number);
    const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
                   'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${dia} ${MESES[mes - 1]} ${anio}`;
}
