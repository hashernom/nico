import { supabase } from './supabase.js';

/**
 * Reintenta una consulta a Supabase con espera creciente. Sin esto, un
 * primer intento fallido en red móvil (común al arrancar, o si el proyecto
 * de Supabase estaba dormido tras la pausa por inactividad) dejaba el
 * módulo en "error al cargar" hasta que alguien recargaba la página.
 */
export async function conReintentos(consulta, { intentos = 3, esperaMs = 800 } = {}) {
    let ultimoError = null;
    for (let intento = 0; intento < intentos; intento++) {
        const { data, error } = await consulta();
        if (!error) return { data, error: null };
        ultimoError = error;
        if (intento < intentos - 1) {
            await new Promise((r) => setTimeout(r, esperaMs * (intento + 1)));
        }
    }
    return { data: null, error: ultimoError };
}

/**
 * Suscribe una tabla a cambios en vivo y resincroniza cuando hace falta:
 * al (re)conectar el socket y al volver a la pestaña (pantalla bloqueada,
 * cambio de app). Sin esto, un cambio del otro dispositivo que llegaba
 * mientras el socket estaba caído se perdía para siempre — había que
 * recargar la página entera para verlo.
 */
export function suscribirEnVivo(tabla, alCambiar) {
    const canal = supabase
        .channel(`${tabla}-vivo`)
        .on('postgres_changes', { event: '*', schema: 'public', table: tabla }, alCambiar)
        .subscribe((estado) => {
            if (estado === 'SUBSCRIBED') alCambiar();
        });

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) alCambiar();
    });

    return canal;
}

/** Pinta el estado de error con un botón para reintentar a mano. */
export function pintarError(contenedor, mensaje, reintentar) {
    contenedor.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'galeria-error';
    p.textContent = mensaje;

    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'reintentar-btn';
    boton.textContent = 'Reintentar';
    boton.addEventListener('click', reintentar);

    p.appendChild(document.createElement('br'));
    p.appendChild(boton);
    contenedor.appendChild(p);
}
