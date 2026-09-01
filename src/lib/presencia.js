// ============================================================
//  PRESENCIA EN VIVO
//  "Nico está en el jardín ahora" — usa Supabase Realtime Presence, el
//  mismo mecanismo (canales) que ya usan los módulos de datos para las
//  actualizaciones en vivo, así que no suma infraestructura nueva.
//
//  No hace falta estar logueado para aparecer: cualquier visita cuenta
//  como presencia, pero solo se puede poner NOMBRE a una presencia que
//  coincide con una de las dos cuentas conocidas (autores.js). Alguien
//  de visita sin sesión simplemente aparece como "alguien más".
// ============================================================

import { supabase } from './supabase.js';
import { alCambiarSesion } from './auth.js';
import { nombreAutor } from './autores.js';

const CANAL = 'jardin-presencia';
// Identifica esta pestaña/dispositivo, no a la persona: si Nico tiene el
// jardín abierto en el celu y la compu a la vez, son dos presencias, y así
// deben tratarse (cada una se puede ir sin afectar a la otra).
const CLAVE_PESTANIA = crypto.randomUUID();

let canal = null;
let elementoAviso = null;
let miUuid = null;

export function setupPresencia() {
    const contenedor = document.getElementById('widgetsIzquierda');
    if (!contenedor) return;

    elementoAviso = document.createElement('div');
    elementoAviso.className = 'presencia-aviso';
    elementoAviso.setAttribute('aria-live', 'polite');
    contenedor.appendChild(elementoAviso);

    canal = supabase.channel(CANAL, {
        config: { presence: { key: CLAVE_PESTANIA } }
    });

    canal
        .on('presence', { event: 'sync' }, actualizarAviso)
        .subscribe((estado) => {
            if (estado === 'SUBSCRIBED') anunciarme();
        });

    // Si inicia/cierra sesión mientras ya está en el jardín, la presencia
    // se actualiza con el nombre correspondiente sin recargar la página.
    alCambiarSesion((sesion) => {
        miUuid = sesion?.user?.id ?? null;
        anunciarme();
    });
}

function anunciarme() {
    canal?.track({ uuid: miUuid });
}

function actualizarAviso() {
    if (!canal) return;

    const estado = canal.presenceState();
    const otrasPestanias = Object.entries(estado)
        .filter(([clave]) => clave !== CLAVE_PESTANIA)
        .flatMap(([, presencias]) => presencias);

    if (otrasPestanias.length === 0) {
        elementoAviso.classList.remove('visible');
        return;
    }

    // Varias pestañas de la misma persona (celular + compu) cuentan una
    // sola vez: lo que importa es QUIÉN está, no cuántas conexiones tiene.
    const nombres = [...new Set(otrasPestanias.map((p) => nombreAutor(p.uuid)).filter(Boolean))];
    const hayAnonimos = otrasPestanias.some((p) => !nombreAutor(p.uuid));

    let texto;
    if (nombres.length > 0) {
        texto = `🌸 ${nombres.join(' y ')} está${nombres.length > 1 ? 'n' : ''} en el jardín ahora`;
    } else if (hayAnonimos) {
        texto = '👀 alguien más está mirando el jardín ahora';
    } else {
        return;
    }

    elementoAviso.textContent = texto;
    elementoAviso.classList.add('visible');
}
