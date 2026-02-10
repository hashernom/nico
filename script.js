// CONFIGURACIÓN
const START_DATE = new Date(2025, 3, 4, 0, 0); 

const CHECKPOINTS = [
    { title: "Primer contacto", date: "2025-04-04",},
    { title: "Primera Cita", date: "2025-04-10",},
    { title: "Conocí a tus papás", date: "2026-01-24",},
    { title: "Primer pico", date: "2026-01-24",},
    { title: "Primer dia en ocaña", date: "2026-02-14",}
];

const PHOTOS = [
    { url: 'img/img1.jpg', caption: 'primera cita' },
    { url: 'img/img2.jpg', caption: 'segunda cita jajaja' }
];

// TIMER
function updateTimer() {
    const now = new Date();
    const diff = now - START_DATE;
    
    // Si la fecha es futura, mostramos ceros o mensaje
    if (diff < 0) {
        document.getElementById('timer').innerHTML = '<p style="width:100%">¡Pronto!</p>';
        return;
    }

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30.44);

    const timerHTML = `
        <div class="time-box"><span class="time-val">${months}</span><span class="time-label">Meses</span></div>
        <div class="time-box"><span class="time-val">${days}</span><span class="time-label">Días</span></div>
        <div class="time-box"><span class="time-val">${hours}</span><span class="time-label">Hrs</span></div>
        <div class="time-box"><span class="time-val">${minutes}</span><span class="time-label">Min</span></div>
        <div class="time-box"><span class="time-val">${seconds}</span><span class="time-label">Seg</span></div>
    `;
    document.getElementById('timer').innerHTML = timerHTML;
}

// RENDERIZADO DE MAPA (Timeline)
function renderCheckpoints() {
    const list = document.getElementById('checkpoints-list');
    let html = '';

    CHECKPOINTS.forEach(point => {
        html += `
        <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <div class="timeline-info">
                    <h3>${point.title}</h3>
                    <span class="timeline-date">${point.date}</span>
                </div>
                <div class="timeline-icon"><i class="fas ${point.icon}"></i></div>
            </div>
        </div>
        `;
    });

    list.innerHTML = html;
}

// RENDERIZADO DE FOTOS
function renderGallery() {
    const gallery = document.getElementById('gallery-grid');
    let html = '';
    PHOTOS.forEach(photo => {
        html += `
        <div class="polaroid">
            <img src="${photo.url}" alt="Foto">
            <p>${photo.caption}</p>
        </div>
        `;
    });
    gallery.innerHTML = html;
}

// INICIALIZAR
setInterval(updateTimer, 1000);
updateTimer();
renderCheckpoints();
renderGallery();