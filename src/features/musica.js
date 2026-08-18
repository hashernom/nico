import { supabase } from '../lib/supabase.js';
import { haySesion, alCambiarSesion } from '../lib/auth.js';
import { etiquetaAutor } from '../lib/autores.js';
import { avisarSiHayNovedad, masReciente } from '../jardin/novedades.js';

// Música: canciones con link y el porqué.
// Cada una es un cassette pixel art; el botón abre el link afuera.
// Nada de iframes de terceros: rompen la estética y meten scripts ajenos.

let canciones = [];

export async function setupMusica() {
    const lista = document.getElementById('musicaLista');
    const form = document.getElementById('cancionForm');
    const inputTitulo = document.getElementById('cancionTitulo');
    const inputUrl = document.getElementById('cancionUrl');
    const inputNota = document.getElementById('cancionNota');
    const estado = document.getElementById('cancionEstado');

    if (!lista) return;

    async function cargar() {
        const { data, error } = await supabase
            .from('songs')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            lista.innerHTML = '<p class="galeria-error">No se pudo cargar la música 😢</p>';
            console.error('Error cargando canciones:', error.message);
            return;
        }
        canciones = data;
        pintar();
        avisarSiHayNovedad('musica', masReciente(canciones));
    }

    function pintar() {
        lista.innerHTML = '';

        if (canciones.length === 0) {
            const vacio = document.createElement('p');
            vacio.className = 'galeria-vacia';
            vacio.textContent = haySesion()
                ? 'Todavía no hay canciones. Agregá la primera 🎵'
                : 'Todavía no hay canciones.';
            lista.appendChild(vacio);
            return;
        }

        canciones.forEach((cancion, indice) => {
            lista.appendChild(construirCassette(cancion, indice));
        });
    }

    function construirCassette(cancion, indice) {
        const cassette = document.createElement('article');
        cassette.className = 'cassette';
        cassette.style.setProperty('--orden', indice);

        const cuerpo = document.createElement('div');
        cuerpo.className = 'cassette-cuerpo';
        cuerpo.innerHTML =
            '<span class="cassette-carrete" aria-hidden="true"></span>' +
            '<span class="cassette-cinta" aria-hidden="true"></span>' +
            '<span class="cassette-carrete" aria-hidden="true"></span>';

        const etiqueta = document.createElement('div');
        etiqueta.className = 'cassette-etiqueta';

        const titulo = document.createElement('h4');
        titulo.className = 'cassette-titulo';
        titulo.appendChild(document.createTextNode(cancion.title));
        titulo.appendChild(etiquetaAutor(cancion.created_by));
        etiqueta.appendChild(titulo);

        if (cancion.note) {
            const nota = document.createElement('p');
            nota.className = 'cassette-nota';
            nota.textContent = cancion.note;
            etiqueta.appendChild(nota);
        }

        cassette.append(cuerpo, etiqueta);

        const destino = urlSegura(cancion.url);
        if (destino) {
            const escuchar = document.createElement('a');
            escuchar.className = 'cassette-play';
            escuchar.href = destino;
            escuchar.target = '_blank';
            escuchar.rel = 'noopener noreferrer';
            escuchar.innerHTML = '<i class="fas fa-play"></i> Escuchar';
            escuchar.setAttribute('aria-label', `Escuchar ${cancion.title}`);
            cassette.appendChild(escuchar);
        }

        if (haySesion()) {
            const borrar = document.createElement('button');
            borrar.className = 'evento-borrar';
            borrar.innerHTML = '<i class="fas fa-trash-alt"></i>';
            borrar.setAttribute('aria-label', `Borrar ${cancion.title}`);
            borrar.addEventListener('click', () => eliminar(cancion));
            cassette.appendChild(borrar);
        }

        return cassette;
    }

    async function eliminar(cancion) {
        if (!haySesion()) return;
        const { error } = await supabase.from('songs').delete().eq('id', cancion.id);
        if (error) console.error('Error borrando canción:', error.message);
    }

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!haySesion()) return;

        const title = inputTitulo.value.trim();
        if (!title) return;

        const url = inputUrl.value.trim();
        if (url && !urlSegura(url)) {
            estado.textContent = 'El link tiene que empezar con http:// o https://';
            return;
        }

        const boton = form.querySelector('button[type="submit"]');
        boton.disabled = true;

        const { error } = await supabase.from('songs').insert({
            title,
            url: url || null,
            note: inputNota.value.trim() || null
        });

        boton.disabled = false;

        if (error) {
            estado.textContent = `Error: ${error.message}`;
            console.error('Error agregando canción:', error.message);
            return;
        }

        form.reset();
        estado.textContent = '¡Canción agregada! 🎵';
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
        .channel('musica-vivo')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'songs' }, cargar)
        .subscribe();
}

// Solo http(s). Un `javascript:` guardado en la tabla no debería poder
// convertirse en un link ejecutable al pintarlo.
function urlSegura(valor) {
    if (!valor) return null;
    try {
        const url = new URL(valor);
        return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
    } catch {
        return null;
    }
}
