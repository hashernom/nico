// ============================================
// CONFIGURACIÓN
// ============================================
const START_DATE = new Date(2025, 3, 4, 0, 0); // 4 de Abril 2025
const MARRIED_DATE = new Date(2026, 1, 21, 0, 0); // 21 de Febrero 2026 (Febrero = 1)

const CHECKPOINTS = [
    { title: "Primer contacto", date: "2025-04-04",},
    { title: "Primera Cita", date: "2025-04-10",},
    { title: "Conocí a tus papás", date: "2026-01-24",},
    { title: "Primer pico", date: "2026-01-24",},
    { title: "Primer dia en ocaña", date: "2026-02-14",},
    { title: "Cena familiar", date: "2026-02-20",},
    { title: "nobios alaberga", date: "2026-02-21",}
];

const PHOTOS = [
    { url: 'img/img1.jpg', caption: 'segunda date jajaja' },
    { url: 'img/img2.jpg', caption: 'primera date :u' },
    { url: 'img/img3.jfif', caption: 'dia de almuerzo con la family' },
    { url: 'img/img4.jfif', caption: 'pre date' },
    { url: 'img/img5.jfif', caption: 'oye bonita!!!' },
    { url: 'img/img6.jfif', caption: 'pechochos' },
    { url: 'img/img7.jfif', caption: 'prueba de embarazo...' },
    { url: 'img/img8.jfif', caption: 'integracion familiar ishh' },
    { url: 'img/img9.jfif', caption: 'pre night' },
    { url: 'img/img10.jfif', caption: 'NO MAMES EL BIG DAY' }
];

// ============================================
// SISTEMA DE PARTÍCULAS
// ============================================
function createParticles() {
    const container = document.getElementById('particles');
    const particleTypes = ['🌸', '🌼', '🍃', '⭐', '✨', '💕', '🌺', '🦋'];
    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = particleTypes[Math.floor(Math.random() * particleTypes.length)];
        
        // Posición inicial aleatoria
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        
        container.appendChild(particle);
    }
}

// ============================================
// TIMER 1 - TIEMPO DESDE QUE SE CONOCIERON
// ============================================
function updateTimer() {
    const now = new Date();
    const diff = now - START_DATE;
    
    // Si la fecha es futura, mostramos mensaje
    if (diff < 0) {
        document.getElementById('timer').innerHTML = '<p style="width:100%; text-align: center; font-family: \'Press Start 2P\'; font-size: 0.8rem;">¡Pronto!</p>';
        return;
    }

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30.44);

    const timerHTML = `
        <div class="time-box">
            <span class="time-val">${months}</span>
            <span class="time-label">Meses</span>
        </div>
        <div class="time-box">
            <span class="time-val">${days}</span>
            <span class="time-label">Días</span>
        </div>
        <div class="time-box">
            <span class="time-val">${hours}</span>
            <span class="time-label">Hrs</span>
        </div>
        <div class="time-box">
            <span class="time-val">${minutes}</span>
            <span class="time-label">Min</span>
        </div>
        <div class="time-box">
            <span class="time-val">${seconds}</span>
            <span class="time-label">Seg</span>
        </div>
    `;
    document.getElementById('timer').innerHTML = timerHTML;
}

// ============================================
// TIMER 2 - TIEMPO DESDE EL 21 DE FEBRERO
// ============================================
function updateTimer2() {
    const now = new Date();
    const diff = now - MARRIED_DATE;
    
    // Si la fecha es futura, mostramos cuenta regresiva
    if (diff < 0) {
        const countdownDiff = Math.abs(diff);
        const daysUntil = Math.floor(countdownDiff / (1000 * 60 * 60 * 24));
        const hoursUntil = Math.floor((countdownDiff / (1000 * 60 * 60)) % 24);
        
        document.getElementById('timer2').innerHTML = `
            <p style="width:100%; text-align: center; font-family: 'Quicksand'; font-weight: 700; font-size: 1rem; padding: 20px;">
                💕 Faltan ${daysUntil} días y ${hoursUntil} horas 💕
            </p>
        `;
        return;
    }

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30.44);

    const timer2HTML = `
        <div class="time-box">
            <span class="time-val">${months}</span>
            <span class="time-label">Meses</span>
        </div>
        <div class="time-box">
            <span class="time-val">${days}</span>
            <span class="time-label">Días</span>
        </div>
        <div class="time-box">
            <span class="time-val">${hours}</span>
            <span class="time-label">Hrs</span>
        </div>
        <div class="time-box">
            <span class="time-val">${minutes}</span>
            <span class="time-label">Min</span>
        </div>
        <div class="time-box">
            <span class="time-val">${seconds}</span>
            <span class="time-label">Seg</span>
        </div>
    `;
    document.getElementById('timer2').innerHTML = timer2HTML;
}

// ============================================
// RENDERIZADO DE CHECKPOINTS (Timeline)
// ============================================
function renderCheckpoints() {
    const list = document.getElementById('checkpoints-list');
    let html = '';

    CHECKPOINTS.forEach((point, index) => {
        html += `
        <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <div class="timeline-info">
                    <h3>${point.title}</h3>
                    <span class="timeline-date">${point.date}</span>
                </div>
                
            </div>
        </div>
        `;
    });

    list.innerHTML = html;
}

// ============================================
// RENDERIZADO DE GALERÍA - ÁLBUM DE RECUERDOS
// ============================================
function renderGallery() {
    const gallery = document.getElementById('gallery-grid');
    let html = '';
    
    PHOTOS.forEach((photo, index) => {
        html += `
        <div class="album-photo" style="animation-delay: ${index * 0.2}s">
            <div class="album-photo-frame">
                <img src="${photo.url}" alt="${photo.caption}" loading="lazy">
            </div>
            <div class="album-caption">${photo.caption}</div>
        </div>
        `;
    });
    
    gallery.innerHTML = html;
    
    // Agregar efecto de click a las fotos DESPUÉS de crearlas
    setTimeout(() => {
        addPhotoClickEffects();
    }, 100);
}

// ============================================
// EFECTOS DE CLICK EN FOTOS
// ============================================
function addPhotoClickEffects() {
    const photos = document.querySelectorAll('.album-photo');
    
    console.log('🎯 Agregando efectos de click a', photos.length, 'fotos');
    
    photos.forEach((photo, index) => {
        // Remover listeners previos si existen
        photo.style.cursor = 'pointer';
        
        photo.addEventListener('click', function(e) {
            console.log('✨ Click en foto', index + 1);
            
            // Efecto de corazones al hacer click
            createHeartBurst(e.clientX, e.clientY);
            
            // Efecto de shake
            this.classList.add('photo-shake');
            setTimeout(() => {
                this.classList.remove('photo-shake');
            }, 500);
        });
    });
}

// ============================================
// EFECTO DE CORAZONES AL HACER CLICK
// ============================================
function createHeartBurst(x, y) {
    const hearts = ['💕', '💖', '💗', '💝', '❤️'];
    const burstCount = 8;
    
    console.log('💕 Creando explosión de corazones en', x, y);
    
    for (let i = 0; i < burstCount; i++) {
        const heart = document.createElement('div');
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.position = 'fixed';
        heart.style.left = x + 'px';
        heart.style.top = y + 'px';
        heart.style.fontSize = '2rem';
        heart.style.pointerEvents = 'none';
        heart.style.zIndex = '99999';
        heart.style.userSelect = 'none';
        
        const angle = (Math.PI * 2 / burstCount) * i;
        const distance = 80 + Math.random() * 60;
        const endX = x + Math.cos(angle) * distance;
        const endY = y + Math.sin(angle) * distance;
        
        document.body.appendChild(heart);
        
        // Animación
        const animation = heart.animate([
            { 
                transform: 'translate(-50%, -50%) scale(0) rotate(0deg)',
                opacity: 1 
            },
            { 
                transform: `translate(${endX - x}px, ${endY - y}px) scale(1.5) rotate(${Math.random() * 720}deg)`,
                opacity: 0 
            }
        ], {
            duration: 1200,
            easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
        });
        
        animation.onfinish = () => {
            heart.remove();
        };
    }
}

// ============================================
// EFECTO DE BRILLO EN TARJETAS
// ============================================
function addCardHoverEffects() {
    const cards = document.querySelectorAll('.stardew-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.filter = 'brightness(1.05)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.filter = 'brightness(1)';
        });
    });
}

// ============================================
// ANIMACIÓN DE ENTRADA PROGRESIVA
// ============================================
function animateOnScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    const cards = document.querySelectorAll('.stardew-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// ============================================
// EFECTO DE ESTRELLAS EN EL TÍTULO
// ============================================
function addTitleSparkles() {
    const titleBox = document.querySelector('.stardew-title-box');
    
    if (!titleBox) return;
    
    setInterval(() => {
        const sparkle = document.createElement('div');
        sparkle.textContent = '✨';
        sparkle.style.position = 'absolute';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.fontSize = '1rem';
        sparkle.style.pointerEvents = 'none';
        
        titleBox.appendChild(sparkle);
        
        sparkle.animate([
            { opacity: 0, transform: 'scale(0) rotate(0deg)' },
            { opacity: 1, transform: 'scale(1.5) rotate(180deg)' },
            { opacity: 0, transform: 'scale(0) rotate(360deg)' }
        ], {
            duration: 2000,
            easing: 'ease-out'
        }).onfinish = () => {
            sparkle.remove();
        };
    }, 3000);
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌾 Iniciando página Stardew Valley...');
    
    // Iniciar todas las funciones
    createParticles();
    updateTimer();
    updateTimer2(); // ← IMPORTANTE: Segundo timer
    renderCheckpoints();
    renderGallery();
    addCardHoverEffects();
    animateOnScroll();
    addTitleSparkles();
    
    // Actualizar ambos timers cada segundo
    setInterval(() => {
        updateTimer();
        updateTimer2(); // ← IMPORTANTE: Actualizar segundo timer
    }, 1000);
    
    console.log('🌾 ¡Página cargada correctamente!');
    console.log('💕 Efectos de click activados en fotos');
});