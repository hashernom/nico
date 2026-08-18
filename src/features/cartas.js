import { supabase } from '../lib/supabase.js';
import { haySesion, alCambiarSesion } from '../lib/auth.js';
import { etiquetaAutor } from '../lib/autores.js';
import { avisarSiHayNovedad, masReciente } from '../jardin/novedades.js';

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
        const { data, error } = await supabase
            .from('letters')
            .select('*')
            .order('written_on', { ascending: false, nullsFirst: false })
            .order('created_at', { ascending: false });

        if (error) {
            lista.innerHTML = '<p class="galeria-error">No se pudieron cargar las cartas 😢</p>';
            console.error('Error cargando cartas:', error.message);
            return;
        }
        cartas = data;
        pintar();
        avisarSiHayNovedad('cartas', masReciente(cartas));
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
        const { error } = await supabase.from('letters').delete().eq('id', carta.id);
        if (error) console.error('Error borrando carta:', error.message);
    }

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!haySesion()) return;

        const body = inputTexto.value.trim();
        if (!body) return;

        const boton = form.querySelector('button[type="submit"]');
        boton.disabled = true;

        const { error } = await supabase.from('letters').insert({
            body,
            written_on: inputFecha.value || null
        });

        boton.disabled = false;

        if (error) {
            estado.textContent = `Error: ${error.message}`;
            console.error('Error agregando carta:', error.message);
            return;
        }

        form.reset();
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

    supabase
        .channel('cartas-vivo')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'letters' }, cargar)
        .subscribe();
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
