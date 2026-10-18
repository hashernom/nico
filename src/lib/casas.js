// ============================================================
//  CASAS: dónde se guarda la selección de cada persona
//  La fuente de verdad es la tabla `casas` de Supabase (una fila por
//  usuario). Si la tabla todavía no existe o no hay red, el resultado se
//  guarda en este navegador (localStorage) y el test sigue funcionando:
//  se avisa que solo vale para este dispositivo.
// ============================================================

import { supabase } from './supabase.js';
import { usuarioActual } from './auth.js';
import { ID_CASAS } from '../jardin/criaturas.js';

const CLAVE_LOCAL = 'casa-local-';

let casas = {}; // uuid -> { casa, puntajes }
let origen = 'nube'; // 'nube' | 'local'
const suscriptores = new Set();

function avisar() {
    suscriptores.forEach((cb) => cb(casas));
    document.dispatchEvent(new CustomEvent('casas-actualizadas', { detail: casas }));
}

export function casasActuales() {
    return casas;
}

export function origenDeCasas() {
    return origen;
}

export function alCambiarCasas(cb) {
    suscriptores.add(cb);
    cb(casas);
    return () => suscriptores.delete(cb);
}

function leerLocal(uuid) {
    try {
        const crudo = localStorage.getItem(CLAVE_LOCAL + uuid);
        if (!crudo) return null;
        const dato = JSON.parse(crudo);
        return ID_CASAS.includes(dato.casa) ? dato : null;
    } catch (e) {
        return null;
    }
}

function escribirLocal(uuid, dato) {
    try {
        if (dato) localStorage.setItem(CLAVE_LOCAL + uuid, JSON.stringify(dato));
        else localStorage.removeItem(CLAVE_LOCAL + uuid);
    } catch (e) {
        /* sin almacenamiento: queda solo en memoria */
    }
}

/** Trae las casas de todos. Devuelve true si salió de la nube. */
export async function cargarCasas() {
    const { data, error } = await supabase.from('casas').select('created_by, casa, puntajes');

    if (error) {
        console.error('No se pudieron leer las casas:', error.message);
        origen = 'local';
        const yo = usuarioActual();
        const local = yo ? leerLocal(yo) : null;
        casas = yo && local ? { [yo]: local } : {};
        avisar();
        return false;
    }

    origen = 'nube';
    casas = {};
    for (const fila of data) {
        if (ID_CASAS.includes(fila.casa)) {
            casas[fila.created_by] = { casa: fila.casa, puntajes: fila.puntajes };
        }
    }
    avisar();
    return true;
}

/** Guarda la selección del usuario actual. Devuelve 'nube' o 'local'. */
export async function guardarCasa(casa, puntajes) {
    const yo = usuarioActual();
    if (!yo) throw new Error('Hace falta iniciar sesión');

    const { error } = await supabase
        .from('casas')
        .insert({ created_by: yo, casa, puntajes });

    if (error) {
        console.error('No se pudo guardar la casa:', error.message);
        origen = 'local';
        escribirLocal(yo, { casa, puntajes });
        casas = { ...casas, [yo]: { casa, puntajes } };
        avisar();
        return 'local';
    }

    origen = 'nube';
    casas = { ...casas, [yo]: { casa, puntajes } };
    avisar();
    return 'nube';
}

/** Borra la selección del usuario actual, para repetir el test. */
export async function reiniciarCasa() {
    const yo = usuarioActual();
    if (!yo) return;

    escribirLocal(yo, null);
    await supabase.from('casas').delete().eq('created_by', yo);

    const { [yo]: _, ...resto } = casas;
    casas = resto;
    avisar();
}
