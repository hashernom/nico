// ============================================================
//  INTERRUPTORES DEL SITIO
//
//  SOMBRERO_ACTIVO: el Sombrero Seleccionador es una sorpresa. Está
//  terminado y funcional, pero oculto: no aparece el objeto en el jardín, no
//  se pinta su sección, no se pide nada a la base de datos y la copa de las
//  casas no se muestra.
//
//  PARA ACTIVARLO: cambiar `false` por `true`, guardar, y publicar.
//  PARA PROBARLO SIN PUBLICAR: abrir el sitio con `?sombrero` al final del
//  link (p. ej. https://antologia-nico.netlify.app/?sombrero). Solo vale en
//  ese dispositivo y hasta cerrar la pestaña; `?sombrero=0` lo apaga.
// ============================================================

const PREVIEW = 'sombrero-preview';

function vistaPrevia() {
    try {
        const valor = new URLSearchParams(window.location.search).get('sombrero');
        if (valor === '0') sessionStorage.removeItem(PREVIEW);
        else if (valor !== null) sessionStorage.setItem(PREVIEW, '1');
        return sessionStorage.getItem(PREVIEW) === '1';
    } catch (e) {
        return false;
    }
}

export const SOMBRERO_ACTIVO = true;

export const sombreroVisible = SOMBRERO_ACTIVO || vistaPrevia();
