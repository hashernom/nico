import { supabase } from '../lib/supabase.js';
import { haySesion, alCambiarSesion, usuarioActual } from '../lib/auth.js';
import { etiquetaAutor } from '../lib/autores.js';
import { avisarSiHayNovedad, masReciente } from '../jardin/novedades.js';
import { conReintentos, suscribirEnVivo, pintarError } from '../lib/vivo.js';

// Antes vivía en localStorage: cada dispositivo veía una lista distinta.
// Ahora es una sola lista en Supabase, sincronizada en vivo entre los dos.

let todos = [];

export async function setupTodos() {
    const panel = document.getElementById('todoPanel');
    const abrirBtn = document.getElementById('todoOpenBtn');
    const cerrarBtn = document.getElementById('todoToggleBtn');
    const input = document.getElementById('todoInput');
    const agregarBtn = document.getElementById('todoAddBtn');
    const lista = document.getElementById('todoList');
    const contador = document.getElementById('todoCount');
    const limpiarBtn = document.getElementById('todoClearDone');

    if (!panel || !lista) return;

    async function cargar() {
        const { data, error } = await conReintentos(() =>
            supabase.from('todos').select('*').order('created_at', { ascending: true })
        );

        if (error) {
            console.error('Error cargando to-dos:', error.message);
            pintarError(lista, 'No se pudieron cargar las tareas 😢', cargar);
            contador.textContent = '';
            return;
        }
        todos = data;
        pintar();
        avisarSiHayNovedad('todos', masReciente(todos));
    }

    function pintar() {
        lista.innerHTML = '';

        todos.forEach((todo) => {
            const li = document.createElement('li');

            const check = document.createElement('button');
            check.className = 'todo-btn' + (todo.done ? ' checked' : '');
            check.innerHTML = todo.done ? '<i class="fas fa-check"></i>' : '';
            check.disabled = !haySesion();
            check.setAttribute('aria-label', todo.done ? 'Marcar pendiente' : 'Marcar hecho');
            check.addEventListener('click', () => alternar(todo));

            const texto = document.createElement('span');
            texto.className = 'todo-text' + (todo.done ? ' done' : '');
            texto.appendChild(document.createTextNode(todo.text)); // sin riesgo de HTML inyectado
            texto.appendChild(etiquetaAutor(todo.created_by));

            const borrar = document.createElement('button');
            borrar.className = 'todo-btn';
            borrar.innerHTML = '<i class="fas fa-trash-alt"></i>';
            borrar.disabled = !haySesion();
            borrar.setAttribute('aria-label', 'Borrar tarea');
            borrar.addEventListener('click', () => eliminar(todo));

            li.append(check, texto, borrar);
            lista.appendChild(li);
        });

        const pendientes = todos.filter((t) => !t.done).length;
        contador.textContent =
            todos.length === 0 ? '0 items' : `${pendientes}/${todos.length} pendientes`;
    }

    // Los tres handlers de abajo aplican el cambio en memoria y repintan
    // ANTES de mandarlo al servidor: el cambio se ve al instante, no
    // depende de esperar el eco de realtime (que en red móvil puede tardar
    // segundos, o perderse del todo si la pestaña estaba en segundo plano).
    // Si el request falla, se revierte y se avisa.

    async function agregar() {
        const texto = input.value.trim();
        if (!texto || !haySesion()) return;

        input.value = '';

        const temporal = {
            id: `temp-${Date.now()}`,
            text: texto,
            done: false,
            created_by: usuarioActual(),
            _optimista: true
        };
        todos.push(temporal);
        pintar();

        const { data, error } = await supabase.from('todos').insert({ text: texto }).select().single();

        if (error) {
            console.error('Error agregando to-do:', error.message);
            todos = todos.filter((t) => t.id !== temporal.id);
            pintar();
            input.value = texto; // se devuelve para no perder lo escrito
            return;
        }

        // Se reemplaza el optimista por la fila real (id y created_by definitivos).
        const indice = todos.findIndex((t) => t.id === temporal.id);
        if (indice !== -1) todos[indice] = data;
        pintar();
    }

    async function alternar(todo) {
        if (!haySesion()) return;

        const anterior = todo.done;
        todo.done = !anterior;
        pintar();

        const { error } = await supabase.from('todos').update({ done: todo.done }).eq('id', todo.id);
        if (error) {
            console.error('Error actualizando to-do:', error.message);
            todo.done = anterior;
            pintar();
        }
    }

    async function eliminar(todo) {
        if (!haySesion()) return;

        const previos = todos;
        todos = todos.filter((t) => t.id !== todo.id);
        pintar();

        const { error } = await supabase.from('todos').delete().eq('id', todo.id);
        if (error) {
            console.error('Error borrando to-do:', error.message);
            todos = previos;
            pintar();
        }
    }

    async function limpiarHechos() {
        if (!haySesion()) return;

        const previos = todos;
        todos = todos.filter((t) => !t.done);
        pintar();

        const { error } = await supabase.from('todos').delete().eq('done', true);
        if (error) {
            console.error('Error limpiando to-dos:', error.message);
            todos = previos;
            pintar();
        }
    }

    agregarBtn.addEventListener('click', agregar);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') agregar();
    });
    limpiarBtn.addEventListener('click', limpiarHechos);

    // En el sitio de scroll la lista vive en un panel flotante que se abre y
    // cierra. En el jardín va dentro del panel de madera y no hace falta:
    // por eso los botones son opcionales.
    if (abrirBtn && cerrarBtn) {
        abrirBtn.addEventListener('click', () => {
            panel.classList.add('open');
            abrirBtn.classList.add('hidden');
        });
        cerrarBtn.addEventListener('click', () => {
            panel.classList.remove('open');
            abrirBtn.classList.remove('hidden');
        });
    }

    // Los controles de escritura aparecen solo con sesión iniciada.
    alCambiarSesion(() => {
        const puedeEditar = haySesion();
        input.disabled = !puedeEditar;
        agregarBtn.disabled = !puedeEditar;
        limpiarBtn.disabled = !puedeEditar;
        input.placeholder = puedeEditar ? 'Nueva tarea...' : 'Iniciá sesión para editar';
        pintar();
    });

    await cargar();
    await importarDeLocalStorage();

    // Realtime: lo que marca el otro dispositivo aparece sin recargar.
    // Los propios cambios ya se ven al instante por la actualización
    // optimista de arriba; esto también resincroniza solo al reconectar
    // el socket o al volver a la pestaña (ver src/lib/vivo.js).
    suscribirEnVivo('todos', cargar);
}

// Rescate único de los to-dos que quedaron guardados en el navegador
// con la versión anterior del sitio.
async function importarDeLocalStorage() {
    const guardado = localStorage.getItem('todos');
    if (!guardado || !haySesion()) return;

    try {
        const viejos = JSON.parse(guardado);
        if (!Array.isArray(viejos) || viejos.length === 0) {
            localStorage.removeItem('todos');
            return;
        }

        const nuevos = viejos
            .filter((t) => t && typeof t.text === 'string' && t.text.trim())
            .map((t) => ({ text: t.text.trim(), done: Boolean(t.done) }));

        if (nuevos.length > 0) {
            const { error } = await supabase.from('todos').insert(nuevos);
            if (error) {
                console.error('No se pudieron importar los to-dos viejos:', error.message);
                return;
            }
            console.log(`✅ Importados ${nuevos.length} to-dos guardados en este navegador`);
        }
        localStorage.removeItem('todos');
    } catch {
        localStorage.removeItem('todos');
    }
}
