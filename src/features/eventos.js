import { supabase } from '../lib/supabase.js';
import { haySesion, alCambiarSesion } from '../lib/auth.js';
import { etiquetaAutor } from '../lib/autores.js';
import { avisarSiHayNovedad, masReciente } from '../jardin/novedades.js';

// Timeline de checkpoints. Antes estaba hardcodeado en script.js.

let eventos = [];

export async function setupEventos() {
    const lista = document.getElementById('checkpoints-list');
    const form = document.getElementById('eventoForm');
    const inputTitulo = document.getElementById('eventoTitulo');
    const inputFecha = document.getElementById('eventoFecha');

    if (!lista) return;

    async function cargar() {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('happened_on', { ascending: true, nullsFirst: false });

        if (error) {
            console.error('Error cargando eventos:', error.message);
            return;
        }
        eventos = data;
        pintar();
        avisarSiHayNovedad('eventos', masReciente(eventos));
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
        const { error } = await supabase.from('events').delete().eq('id', evento.id);
        if (error) console.error('Error borrando evento:', error.message);
    }

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!haySesion()) return;

        const title = inputTitulo.value.trim();
        if (!title) return;

        const { error } = await supabase.from('events').insert({
            title,
            happened_on: inputFecha.value || null
        });

        if (error) {
            console.error('Error agregando evento:', error.message);
            return;
        }
        form.reset();
    });

    alCambiarSesion(() => {
        form?.classList.toggle('oculto', !haySesion());
        pintar();
    });

    await cargar();

    supabase
        .channel('eventos-vivo')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, cargar)
        .subscribe();
}
