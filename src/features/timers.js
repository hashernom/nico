// Fechas fijas: se cambian casi nunca, no vale la pena una tabla para esto.
const FECHA_INICIO = new Date(2025, 3, 4, 0, 0);   // 4 de abril 2025

// El de casados queda pausado en cero a propósito (pedido explícito):
// FECHA_CASADOS se conserva sin usar para el día que se retome.
// const FECHA_CASADOS = new Date(2026, 1, 21, 0, 0); // 21 de febrero 2026

const DIAS_POR_MES = 30.44;

function partirDuracion(ms) {
    const dias = Math.floor(ms / (1000 * 60 * 60 * 24));
    return {
        meses: Math.floor(dias / DIAS_POR_MES),
        dias,
        horas: Math.floor((ms / (1000 * 60 * 60)) % 24),
        minutos: Math.floor((ms / (1000 * 60)) % 60),
        segundos: Math.floor((ms / 1000) % 60)
    };
}

function cajasHTML({ meses, dias, horas, minutos, segundos }) {
    const cajas = [
        [meses, 'Meses'],
        [dias, 'Días'],
        [horas, 'Hrs'],
        [minutos, 'Min'],
        [segundos, 'Seg']
    ];
    return cajas
        .map(
            ([valor, etiqueta]) => `
        <div class="time-box">
            <span class="time-val">${valor}</span>
            <span class="time-label">${etiqueta}</span>
        </div>`
        )
        .join('');
}

function pintarContador(elemento, desde) {
    const diff = Date.now() - desde.getTime();

    if (diff < 0) {
        const falta = partirDuracion(Math.abs(diff));
        elemento.innerHTML = `
            <p class="timer-espera">
                💕 Faltan ${falta.dias} días y ${falta.horas} horas 💕
            </p>`;
        return;
    }

    elemento.innerHTML = cajasHTML(partirDuracion(diff));
}

export function setupTimers() {
    const timer1 = document.getElementById('timer');
    const timer2 = document.getElementById('timer2');
    if (!timer1 || !timer2) return;

    // Pausado en cero: se pinta una sola vez, no entra al intervalo de abajo.
    timer2.innerHTML = cajasHTML({ meses: 0, dias: 0, horas: 0, minutos: 0, segundos: 0 });

    function actualizar() {
        pintarContador(timer1, FECHA_INICIO);
    }

    actualizar();
    setInterval(actualizar, 1000);
}
