// ============================================
// CONFIGURACIÓN
// ============================================
const START_DATE = new Date(2025, 3, 4, 0, 0); 

const CHECKPOINTS = [
    { title: "Primer contacto", date: "2025-04-04",},
    { title: "Primera Cita", date: "2025-04-10",},
    { title: "Conocí a tus papás", date: "2026-01-24",},
    { title: "Primer pico", date: "2026-01-24",},
    { title: "Primer dia en ocaña", date: "2026-02-14",}
];

const PHOTOS = [
    { url: 'img/img1.jpg', caption: 'segunda date jajaja' },
    { url: 'img/img2.jpg', caption: 'primera date :u' },
    { url: 'img/img3.jfif', caption: 'dia de almuerzo con la family' },
    { url: 'img/img4.jfif', caption: 'pre date' },
    { url: 'img/img5.jfif', caption: 'oye bonita!!!' },
    { url: 'img/img6.jfif', caption: 'pechochos' }
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
// TIMER
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
    
    // Agregar efecto de click a las fotos
    addPhotoClickEffects();
}

// ============================================
// EFECTOS DE CLICK EN FOTOS
// ============================================
function addPhotoClickEffects() {
    const photos = document.querySelectorAll('.album-photo');
    
    photos.forEach(photo => {
        photo.addEventListener('click', function(e) {
            // Efecto de corazones al hacer click
            createHeartBurst(e.pageX, e.pageY);
            
            // Efecto de shake
            this.style.animation = 'none';
            setTimeout(() => {
                this.style.animation = '';
            }, 10);
        });
    });
}

// ============================================
// EFECTO DE CORAZONES AL HACER CLICK
// ============================================
function createHeartBurst(x, y) {
    const hearts = ['💕', '💖', '💗', '💝'];
    const burstCount = 6;
    
    for (let i = 0; i < burstCount; i++) {
        const heart = document.createElement('div');
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.position = 'fixed';
        heart.style.left = x + 'px';
        heart.style.top = y + 'px';
        heart.style.fontSize = '1.5rem';
        heart.style.pointerEvents = 'none';
        heart.style.zIndex = '9999';
        
        const angle = (Math.PI * 2 / burstCount) * i;
        const distance = 50 + Math.random() * 50;
        const endX = x + Math.cos(angle) * distance;
        const endY = y + Math.sin(angle) * distance;
        
        document.body.appendChild(heart);
        
        // Animación
        heart.animate([
            { 
                transform: 'translate(0, 0) scale(0) rotate(0deg)',
                opacity: 1 
            },
            { 
                transform: `translate(${endX - x}px, ${endY - y}px) scale(1.5) rotate(${Math.random() * 360}deg)`,
                opacity: 0 
            }
        ], {
            duration: 1000,
            easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
        }).onfinish = () => {
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
// EFECTO DE SONIDO (OPCIONAL)
// ============================================
function playClickSound() {
    // Aquí puedes agregar sonidos si lo deseas
    // Por ahora solo un efecto visual
    console.log('✨ Click!');
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
    // Iniciar todas las funciones
    createParticles();
    updateTimer();
    renderCheckpoints();
    renderGallery();
    addCardHoverEffects();
    animateOnScroll();
    addTitleSparkles();
    
    // Actualizar timer cada segundo
    setInterval(updateTimer, 1000);
    
    console.log('🌾 Página estilo Stardew Valley cargada correctamente! 🌾');
});

// ============================================
// EFECTO DE CURSOR PERSONALIZADO (OPCIONAL)
// ============================================
document.addEventListener('mousemove', function(e) {
    // Puedes agregar un cursor personalizado aquí si lo deseas
    // Por ejemplo, una mini estrella que siga al cursor
});
