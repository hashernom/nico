import { supabase } from '../lib/supabase.js';
import { haySesion, alCambiarSesion } from '../lib/auth.js';

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
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            contador.textContent = 'Error al cargar';
            console.error('Error cargando to-dos:', error.message);
            return;
        }
        todos = data;
        pintar();
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
            texto.textContent = todo.text; // textContent = sin riesgo de HTML inyectado

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

    async function agregar() {
        const texto = input.value.trim();
        if (!texto || !haySesion()) return;

        input.value = '';
        const { error } = await supabase.from('todos').insert({ text: texto });
        if (error) {
            console.error('Error agregando to-do:', error.message);
            input.value = texto; // se devuelve para no perder lo escrito
        }
    }

    async function alternar(todo) {
        if (!haySesion()) return;
        const { error } = await supabase
            .from('todos')
            .update({ done: !todo.done })
            .eq('id', todo.id);
        if (error) console.error('Error actualizando to-do:', error.message);
    }

    async function eliminar(todo) {
        if (!haySesion()) return;
        const { error } = await supabase.from('todos').delete().eq('id', todo.id);
        if (error) console.error('Error borrando to-do:', error.message);
    }

    async function limpiarHechos() {
        if (!haySesion()) return;
        const { error } = await supabase.from('todos').delete().eq('done', true);
        if (error) console.error('Error limpiando to-dos:', error.message);
    }

    agregarBtn.addEventListener('click', agregar);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') agregar();
    });
    limpiarBtn.addEventListener('click', limpiarHechos);

    abrirBtn.addEventListener('click', () => {
        panel.classList.add('open');
        abrirBtn.classList.add('hidden');
    });
    cerrarBtn.addEventListener('click', () => {
        panel.classList.remove('open');
        abrirBtn.classList.remove('hidden');
    });

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

    // Realtime: lo que uno marca aparece en el celular del otro sin recargar.
    supabase
        .channel('todos-vivo')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'todos' }, cargar)
        .subscribe();
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
