import { supabase } from './supabase.js';

// Estado de sesión compartido. El resto de los módulos se suscribe con
// alCambiarSesion() para mostrar u ocultar sus controles de edición.
let sesion = null;
const suscriptores = new Set();

export function haySesion() {
    return sesion !== null;
}

export function alCambiarSesion(callback) {
    suscriptores.add(callback);
    callback(sesion); // estado actual, para que el módulo se pinte de entrada
    return () => suscriptores.delete(callback);
}

function avisar() {
    document.body.classList.toggle('con-sesion', haySesion());
    suscriptores.forEach((cb) => cb(sesion));
}

export async function iniciarSesion(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
}

export async function cerrarSesion() {
    await supabase.auth.signOut();
}

export async function setupAuth() {
    const { data } = await supabase.auth.getSession();
    sesion = data.session;

    supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
        sesion = nuevaSesion;
        avisar();
    });

    montarUI();
    avisar();
}

function montarUI() {
    const boton = document.getElementById('authBtn');
    const modal = document.getElementById('authModal');
    const form = document.getElementById('authForm');
    const cerrar = document.getElementById('authCerrar');
    const error = document.getElementById('authError');
    const emailInput = document.getElementById('authEmail');
    const passInput = document.getElementById('authPass');

    if (!boton || !modal || !form) return;

    function abrirModal() {
        modal.classList.add('active');
        error.textContent = '';
        emailInput.focus();
    }

    function cerrarModal() {
        modal.classList.remove('active');
        form.reset();
        error.textContent = '';
    }

    boton.addEventListener('click', async () => {
        if (haySesion()) {
            await cerrarSesion();
        } else {
            abrirModal();
        }
    });

    cerrar.addEventListener('click', cerrarModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) cerrarModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) cerrarModal();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        error.textContent = '';
        const boton = form.querySelector('button[type="submit"]');
        boton.disabled = true;
        try {
            await iniciarSesion(emailInput.value.trim(), passInput.value);
            cerrarModal();
        } catch (err) {
            error.textContent = err.message === 'Invalid login credentials'
                ? 'Email o contraseña incorrectos'
                : err.message;
        } finally {
            boton.disabled = false;
        }
    });

    // El texto del botón sigue el estado de sesión
    alCambiarSesion(() => {
        boton.innerHTML = haySesion()
            ? '<i class="fas fa-lock-open"></i>'
            : '<i class="fas fa-lock"></i>';
        boton.setAttribute('aria-label', haySesion() ? 'Cerrar sesión' : 'Iniciar sesión');
        boton.title = haySesion() ? 'Cerrar sesión' : 'Iniciar sesión para editar';
    });
}
