import { supabase } from '../lib/supabase.js';
import { haySesion, alCambiarSesion } from '../lib/auth.js';
import { comprimirImagen, nombreUnico, formatearPeso } from '../lib/imagen.js';
import { etiquetaAutor } from '../lib/autores.js';
import { avisarSiHayNovedad, masReciente } from '../jardin/novedades.js';
import { explosionDeCorazones } from './decorativo.js';
import { abrirLightbox } from './lightbox.js';

const BUCKET = 'fotos';

let fotos = [];        // orden del álbum: sort_index, inamovible para lo viejo
let fotosVista = [];   // lo que se está mostrando ahora (puede estar reordenado)
let ordenActual = 'album';

export function fotosActuales() {
    // El lightbox navega por índice sobre esto: tiene que ser SIEMPRE el
    // mismo orden que se ve en la grilla, no el orden "de base".
    return fotosVista;
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
    const botonesOrden = document.querySelectorAll('#galeriaOrden .galeria-orden-btn');

    if (!grid) return;

    async function cargar() {
        const { data, error } = await supabase
            .from('photos')
            .select('*')
            .order('sort_index', { ascending: true })
            .order('created_at', { ascending: true });

        if (error) {
            grid.innerHTML = '<p class="galeria-error">No se pudieron cargar las fotos 😢</p>';
            console.error('Error cargando fotos:', error.message);
            return;
        }
        fotos = data;
        aplicarOrden();
        avisarSiHayNovedad('galeria', masReciente(fotos));
    }

    // "Álbum" es el orden de sort_index (fotos viejas fijas, nuevas al
    // final); los otros dos son una vista de solo lectura por fecha, no
    // tocan sort_index ni el orden de base.
    function aplicarOrden() {
        if (ordenActual === 'nuevas') {
            fotosVista = [...fotos].sort((a, b) => b.created_at.localeCompare(a.created_at));
        } else if (ordenActual === 'viejas') {
            fotosVista = [...fotos].sort((a, b) => a.created_at.localeCompare(b.created_at));
        } else {
            fotosVista = fotos;
        }
        pintar();
    }

    function pintar() {
        grid.innerHTML = '';

        if (fotosVista.length === 0) {
            const vacio = document.createElement('p');
            vacio.className = 'galeria-vacia';
            vacio.textContent = haySesion()
                ? 'Todavía no hay fotos. ¡Subí la primera!'
                : 'Todavía no hay fotos.';
            grid.appendChild(vacio);
            return;
        }

        fotosVista.forEach((foto, indice) => {
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

        const { error: errorStorage } = await supabase.storage
            .from(BUCKET)
            .remove([foto.storage_path]);
        if (errorStorage) console.error('Error borrando archivo:', errorStorage.message);

        const { error } = await supabase.from('photos').delete().eq('id', foto.id);
        if (error) console.error('Error borrando foto:', error.message);
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

            // sort_index por defecto en la tabla es 0: si no se manda uno
            // explícito acá, la foto nueva empata con la primera del álbum
            // viejo y termina mezclada al principio en vez de al final.
            const proximoIndice = fotos.reduce((max, f) => Math.max(max, f.sort_index), -1) + 1;

            const { error: errorFila } = await supabase.from('photos').insert({
                storage_path: ruta,
                caption: inputCaption.value.trim(),
                taken_on: inputFecha.value || null,
                sort_index: proximoIndice
            });

            if (errorFila) throw errorFila;

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

    botonesOrden.forEach((boton) => {
        boton.addEventListener('click', () => {
            if (boton.classList.contains('activo')) return;
            botonesOrden.forEach((b) => b.classList.remove('activo'));
            boton.classList.add('activo');
            ordenActual = boton.dataset.orden;
            aplicarOrden();
        });
    });

    await cargar();

    supabase
        .channel('fotos-vivo')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'photos' }, cargar)
        .subscribe();
}
