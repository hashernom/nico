import { supabase } from '../lib/supabase.js';
import { haySesion, alCambiarSesion } from '../lib/auth.js';
import { comprimirImagen, nombreUnico, formatearPeso } from '../lib/imagen.js';
import { etiquetaAutor } from '../lib/autores.js';
import { avisarSiHayNovedad, masReciente } from '../jardin/novedades.js';
import { conReintentos, suscribirEnVivo, pintarError } from '../lib/vivo.js';
import { explosionDeCorazones } from './decorativo.js';
import { abrirLightbox } from './lightbox.js';

const BUCKET = 'fotos';

let fotos = [];

export function fotosActuales() {
    return fotos;
}

export function urlPublica(storagePath) {
    return supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

export async function setupGaleria() {
    const grid = document.getElementById('gallery-grid');
    const form = document.getElementById('fotoForm');
    const inputArchivo = document.getElementById('fotoArchivo');
    const inputCaption = document.getElementById('fotoCaption');
    const inputFecha = document.getElementById('fotoFecha');
    const estado = document.getElementById('fotoEstado');

    if (!grid) return;

    async function cargar() {
        const { data, error } = await conReintentos(() =>
            supabase
                .from('photos')
                .select('*')
                .order('sort_index', { ascending: true })
                .order('created_at', { ascending: true })
        );

        if (error) {
            console.error('Error cargando fotos:', error.message);
            pintarError(grid, 'No se pudieron cargar las fotos 😢', cargar);
            return;
        }
        fotos = data;
        pintar();
        avisarSiHayNovedad('galeria', masReciente(fotos));
    }

    function pintar() {
        grid.innerHTML = '';

        if (fotos.length === 0) {
            const vacio = document.createElement('p');
            vacio.className = 'galeria-vacia';
            vacio.textContent = haySesion()
                ? 'Todavía no hay fotos. ¡Subí la primera!'
                : 'Todavía no hay fotos.';
            grid.appendChild(vacio);
            return;
        }

        fotos.forEach((foto, indice) => {
            const contenedor = document.createElement('div');
            contenedor.className = 'album-photo';
            contenedor.style.animationDelay = `${indice * 0.05}s`;

            const img = document.createElement('img');
            img.src = urlPublica(foto.storage_path);
            img.alt = foto.caption || 'Recuerdo';
            img.loading = indice < 6 ? 'eager' : 'lazy';

            const caption = document.createElement('div');
            caption.className = 'album-caption';
            caption.appendChild(document.createTextNode(foto.caption));
            caption.appendChild(etiquetaAutor(foto.created_by));

            contenedor.append(img, caption);

            contenedor.addEventListener('click', (e) => {
                if (e.target.closest('.foto-borrar')) return;
                explosionDeCorazones(e.clientX, e.clientY);
                abrirLightbox(indice);
            });

            if (haySesion()) {
                const borrar = document.createElement('button');
                borrar.className = 'foto-borrar';
                borrar.innerHTML = '<i class="fas fa-trash-alt"></i>';
                borrar.setAttribute('aria-label', `Borrar foto ${foto.caption}`);
                borrar.addEventListener('click', (e) => {
                    e.stopPropagation();
                    eliminar(foto);
                });
                contenedor.appendChild(borrar);
            }

            grid.appendChild(contenedor);
        });
    }

    async function eliminar(foto) {
        if (!haySesion()) return;

        const previas = fotos;
        fotos = fotos.filter((f) => f.id !== foto.id);
        pintar();

        const { error: errorStorage } = await supabase.storage
            .from(BUCKET)
            .remove([foto.storage_path]);
        if (errorStorage) console.error('Error borrando archivo:', errorStorage.message);

        const { error } = await supabase.from('photos').delete().eq('id', foto.id);
        if (error) {
            console.error('Error borrando foto:', error.message);
            fotos = previas;
            pintar();
        }
    }

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!haySesion()) return;

        const archivo = inputArchivo.files[0];
        if (!archivo) return;

        const boton = form.querySelector('button[type="submit"]');
        boton.disabled = true;
        estado.textContent = 'Procesando imagen...';

        try {
            const { blob, extension } = await comprimirImagen(archivo);
            estado.textContent = `Subiendo (${formatearPeso(archivo.size)} → ${formatearPeso(
                blob.size
            )})...`;

            const ruta = nombreUnico(extension);
            const { error: errorSubida } = await supabase.storage
                .from(BUCKET)
                .upload(ruta, blob, { contentType: blob.type || 'image/jpeg' });

            if (errorSubida) throw errorSubida;

            const { data, error: errorFila } = await supabase
                .from('photos')
                .insert({
                    storage_path: ruta,
                    caption: inputCaption.value.trim(),
                    taken_on: inputFecha.value || null
                })
                .select()
                .single();

            if (errorFila) throw errorFila;

            // No hace falta esperar el eco de realtime para verla: ya se tiene
            // la fila real (con su id) devuelta por el insert.
            fotos = [...fotos, data];
            pintar();

            form.reset();
            estado.textContent = '¡Foto subida! 💕';
            setTimeout(() => {
                estado.textContent = '';
            }, 3000);
        } catch (err) {
            estado.textContent = `Error: ${err.message}`;
            console.error('Error subiendo foto:', err);
        } finally {
            boton.disabled = false;
        }
    });

    alCambiarSesion(() => {
        form?.classList.toggle('oculto', !haySesion());
        pintar();
    });

    await cargar();

    suscribirEnVivo('photos', cargar);
}
