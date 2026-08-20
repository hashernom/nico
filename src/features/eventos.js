import { supabase } from '../lib/supabase.js';
import { haySesion, alCambiarSesion, usuarioActual } from '../lib/auth.js';
import { etiquetaAutor } from '../lib/autores.js';
import { avisarSiHayNovedad, masReciente } from '../jardin/novedades.js';
import { conReintentos, suscribirEnVivo, pintarError } from '../lib/vivo.js';

// Timeline de checkpoints. Antes estaba hardcodeado en script.js.

let eventos = [];

export async function setupEventos() {
    const lista = document.getElementById('checkpoints-list');
    const form = document.getElementById('eventoForm');
    const inputTitulo = document.getElementById('eventoTitulo');
    const inputFecha = document.getElementById('eventoFecha');

    if (!lista) return;

    async function cargar() {
        const { data, error } = await conReintentos(() =>
            supabase
                .from('events')
                .select('*')
                .order('happened_on', { ascending: true, nullsFirst: false })
        );

        if (error) {
            console.error('Error cargando eventos:', error.message);
            pintarError(lista, 'No se pudieron cargar los eventos 😢', cargar);
            return;
        }
        eventos = data;
        pintar();
        avisarSiHayNovedad('eventos', masReciente(eventos));
    }

    // Mismo orden que la consulta de arriba: fecha ascendente, sin fecha al final.
    function ordenar(items) {
        return [...items].sort((a, b) => {
            if (!a.happened_on) return 1;
            if (!b.happened_on) return -1;
            return a.happened_on.localeCompare(b.happened_on);
        });
    }

    function pintar() {
        lista.innerHTML = '';

        eventos.forEach((evento) => {
            const item = document.createElement('div');
            item.className = 'timeline-item';

            const punto = document.createElement('div');
            punto.className = 'timeline-dot';

            const contenido = document.createElement('div');
            contenido.className = 'timeline-content';

            const info = document.createElement('div');
            info.className = 'timeline-info';

            const titulo = document.createElement('h3');
            titulo.textContent = evento.title;

            const fecha = document.createElement('span');
            fecha.className = 'timeline-date';
            fecha.textContent = evento.happened_on ?? 'sin fecha';
            fecha.appendChild(etiquetaAutor(evento.created_by));

            info.append(titulo, fecha);
            contenido.appendChild(info);

            if (haySesion()) {
                const borrar = document.createElement('button');
                borrar.className = 'evento-borrar';
                borrar.innerHTML = '<i class="fas fa-trash-alt"></i>';
                borrar.setAttribute('aria-label', `Borrar evento ${evento.title}`);
                borrar.addEventListener('click', () => eliminar(evento));
                contenido.appendChild(borrar);
            }

            item.append(punto, contenido);
            lista.appendChild(item);
        });
    }

    async function eliminar(evento) {
        if (!haySesion()) return;

        const previos = eventos;
        eventos = eventos.filter((e) => e.id !== evento.id);
        pintar();

        const { error } = await supabase.from('events').delete().eq('id', evento.id);
        if (error) {
            console.error('Error borrando evento:', error.message);
            eventos = previos;
            pintar();
        }
    }

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!haySesion()) return;

        const title = inputTitulo.value.trim();
        if (!title) return;
        const happened_on = inputFecha.value || null;

        form.reset();
        const temporal = {
            id: `temp-${Date.now()}`,
            title,
            happened_on,
            created_by: usuarioActual(),
            _optimista: true
        };
        eventos = ordenar([...eventos, temporal]);
        pintar();

        const { data, error } = await supabase
            .from('events')
            .insert({ title, happened_on })
            .select()
            .single();

        if (error) {
            console.error('Error agregando evento:', error.message);
            eventos = eventos.filter((ev) => ev.id !== temporal.id);
            pintar();
            return;
        }

        eventos = ordenar(eventos.map((ev) => (ev.id === temporal.id ? data : ev)));
        pintar();
    });

    alCambiarSesion(() => {
        form?.classList.toggle('oculto', !haySesion());
        pintar();
    });

    await cargar();

    suscribirEnVivo('events', cargar);
}
