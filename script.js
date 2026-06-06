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
    { title: "nobios alaberga", date: "2026-02-21",},
    { title: "primera date de cine", date: "2026-03-18",},
    { title: "primer mes", date: "2026-03-21",},
    { title: "el mejo regalo del mundo", date: "2026-03-21",},
    { title: "Santiago arrives ocaña once again", date: "2026-03-28",},
    { title: "Serenata de cumpeaños 18 de nico", date: "",},
    { title: "", date: "",}
];

const PHOTOS = [
    { url: 'img/img1.jpg', caption: 'segunda date jajaja' },
    { url: 'img/img2.jpg', caption: 'primera date :u' },
    { url: 'img/img3.jpg', caption: 'dia de almuerzo con la family' },
    { url: 'img/img4.jpg', caption: 'pre date' },
    { url: 'img/img5.jpg', caption: 'oye bonita!!!' },
    { url: 'img/img6.jpg', caption: 'pechochos' },
    { url: 'img/img7.jpg', caption: 'prueba de embarazo...' },
    { url: 'img/img8.jpg', caption: 'integracion familiar ishh' },
    { url: 'img/img9.jpg', caption: 'pre night' },
    { url: 'img/img10.jpg', caption: 'NO MAMES EL BIG DAY' },
    { url: 'img/img10.1.jpeg', caption: 'Best date' },
    { url: 'img/img11.jpeg', caption: 'primer mes!!!!' },
    { url: 'img/img12.jpeg', caption: 'El mejor regalo del mundo lit' },
    { url: 'img/img13.jpeg', caption: 'Almuerzo de pumple de mi nico' },
    { url: 'img/img14.jpeg', caption: 'us 4:3' },
    { url: 'img/img15.jpeg', caption: 'Pumple de mamor bello mua' },
    { url: 'img/img16.jpeg', caption: 'primer beso formal' },
    { url: 'img/img17.jpeg', caption: 'brunch con el suegro' },
    { url: 'img/img18.jpeg', caption: 'mi foto fav por ahora (4/04/2026)' },
    { url: 'img/img19.jpeg', caption: '' },
    { url: 'img/img20.jpeg', caption: '' },
    { url: 'img/img21.jpeg', caption: '' },
    { url: 'img/img22.jpeg', caption: '' },
    { url: 'img/img23.jpeg', caption: '' },
    { url: 'img/img24.jpeg', caption: '' },
    { url: 'img/img25.jpeg', caption: '' },
    { url: 'img/img26.jpeg', caption: '' }
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
    
    photos.forEach(photo => {
        photo.style.cursor = 'pointer';
    });
}

// ============================================
// LIGHTBOX - EXPANSIÓN DE IMÁGENES
// ============================================
function setupLightbox() {
    const overlay = document.getElementById('lightboxOverlay');
    const closeBtn = document.getElementById('lightboxClose');
    const imgEl = document.getElementById('lightboxImg');
    const captionEl = document.getElementById('lightboxCaption');

    document.querySelectorAll('.album-photo').forEach(photo => {
        photo.addEventListener('click', function(e) {
            // Heart burst
            createHeartBurst(e.clientX, e.clientY);

            // Shake effect
            this.classList.add('photo-shake');
            setTimeout(() => this.classList.remove('photo-shake'), 500);

            // Lightbox open
            const img = this.querySelector('img');
            const captionDiv = this.querySelector('.album-caption');
            const src = img.getAttribute('src');
            const caption = captionDiv ? captionDiv.textContent : '';

            imgEl.src = src;
            imgEl.alt = caption;
            captionEl.textContent = caption || '\u00A0';
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeLightbox() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeLightbox();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeLightbox();
    });
}

// ============================================
// MODO OSCURO CON ESTRELLAS Y LUCIÉRNAGAS
// ============================================
function createStars() {
    const container = document.createElement('div');
    container.className = 'stars-container';
    container.id = 'starsContainer';
    document.body.prepend(container);

    for (let i = 0; i < 120; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = 1 + Math.random() * 3;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.setProperty('--duration', 2 + Math.random() * 4 + 's');
        star.style.setProperty('--delay', Math.random() * 5 + 's');
        star.style.setProperty('--min-opacity', 0.2 + Math.random() * 0.3);
        star.style.setProperty('--max-opacity', 0.6 + Math.random() * 0.4);
        container.appendChild(star);
    }

    for (let i = 0; i < 20; i++) {
        const firefly = document.createElement('div');
        firefly.className = 'firefly';
        firefly.style.left = Math.random() * 100 + '%';
        firefly.style.top = Math.random() * 100 + '%';
        firefly.style.setProperty('--fly-duration', 6 + Math.random() * 8 + 's');
        firefly.style.setProperty('--fly-delay', Math.random() * 10 + 's');
        firefly.style.setProperty('--fly-x', (-200 + Math.random() * 400) + 'px');
        firefly.style.setProperty('--fly-y', (-200 + Math.random() * 400) + 'px');
        container.appendChild(firefly);
    }
}

function setupDarkMode() {
    const toggle = document.getElementById('darkToggle');
    const icon = toggle.querySelector('.toggle-icon');

    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        icon.textContent = '☀️';
    }

    toggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        icon.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('darkMode', isDark);
    });
}

// ============================================
// TO-DO LIST PANEL
// ============================================
function setupTodoPanel() {
    const panel = document.getElementById('todoPanel');
    const openBtn = document.getElementById('todoOpenBtn');
    const toggleBtn = document.getElementById('todoToggleBtn');
    const input = document.getElementById('todoInput');
    const addBtn = document.getElementById('todoAddBtn');
    const list = document.getElementById('todoList');

    function loadTodos() {
        const saved = localStorage.getItem('todos');
        return saved ? JSON.parse(saved) : [];
    }

    function saveTodos(todos) {
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    function renderTodos() {
        const todos = loadTodos();
        list.innerHTML = '';
        todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <button class="todo-check ${todo.done ? 'checked' : ''}" data-index="${index}">
                    ${todo.done ? '<i class="fas fa-check"></i>' : ''}
                </button>
                <span class="todo-text ${todo.done ? 'done' : ''}">${escapeHtml(todo.text)}</span>
                <button class="todo-del" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
            `;
            list.appendChild(li);
        });

        list.querySelectorAll('.todo-check').forEach(btn => {
            btn.addEventListener('click', function() {
                const todos = loadTodos();
                const idx = parseInt(this.dataset.index);
                todos[idx].done = !todos[idx].done;
                saveTodos(todos);
                renderTodos();
            });
        });

        list.querySelectorAll('.todo-del').forEach(btn => {
            btn.addEventListener('click', function() {
                const todos = loadTodos();
                const idx = parseInt(this.dataset.index);
                todos.splice(idx, 1);
                saveTodos(todos);
                renderTodos();
            });
        });
    }

    function escapeHtml(text) {
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }

    function addTodo() {
        const text = input.value.trim();
        if (!text) return;
        const todos = loadTodos();
        todos.push({ text, done: false });
        saveTodos(todos);
        renderTodos();
        input.value = '';
    }

    addBtn.addEventListener('click', addTodo);
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') addTodo();
    });

    function openPanel() {
        panel.classList.add('open');
        openBtn.classList.add('hidden');
    }

    function closePanel() {
        panel.classList.remove('open');
        openBtn.classList.remove('hidden');
    }

    openBtn.addEventListener('click', openPanel);
    toggleBtn.addEventListener('click', closePanel);

    renderTodos();
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
// MANEJO DE ANIMACIÓN DE FLORES (CLICK PARA OCULTAR)
// ============================================
function setupFlowerAnimationClick() {
    const flowerAnimation = document.querySelector('.flower-animation');
    const mainContainer = document.querySelector('.main-container');
    const particlesContainer = document.getElementById('particles');
    
    if (!flowerAnimation) {
        console.log('⚠️ No se encontró el contenedor de animación de flores');
        return;
    }
    
    // Agregar evento click para ocultar animación y mostrar contenido principal
    flowerAnimation.addEventListener('click', function() {
        console.log('🌸 Click en animación de flores - Mostrando contenido principal');
        
        // Ocultar animación de flores con transición usando clase CSS
        flowerAnimation.classList.add('hidden');
        
        // Mostrar contenido principal y partículas usando clases CSS
        if (mainContainer) {
            mainContainer.classList.remove('initial-hidden');
            mainContainer.classList.add('show');
        }
        if (particlesContainer) {
            particlesContainer.classList.remove('initial-hidden');
            particlesContainer.classList.add('show');
        }
        
        // Remover completamente el contenedor después de la transición
        setTimeout(() => {
            flowerAnimation.style.display = 'none';
            console.log('✅ Animación de flores ocultada, contenido principal visible');
        }, 500);
    });
    
    // Agregar indicador visual de que es clickeable
    flowerAnimation.style.cursor = 'pointer';
    flowerAnimation.title = 'Haz click para continuar a la página principal';
    
    console.log('🌸 Animación de flores configurada - Click para continuar');
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌾 Iniciando página Stardew Valley...');
    
    // Configurar animación de flores (click para ocultar)
    setupFlowerAnimationClick();
    
    // Crear cielo estrellado (modo oscuro)
    createStars();
    
    // Iniciar todas las funciones
    createParticles();
    updateTimer();
    updateTimer2();
    renderCheckpoints();
    renderGallery();
    addCardHoverEffects();
    animateOnScroll();
    addTitleSparkles();
    
    // Nuevas funcionalidades
    setTimeout(setupLightbox, 200);
    setupDarkMode();
    setupTodoPanel();
    
    // Actualizar ambos timers cada segundo
    setInterval(() => {
        updateTimer();
        updateTimer2();
    }, 1000);
    
    console.log('🌾 ¡Página cargada correctamente!');
    console.log('💕 Efectos de click activados en fotos');
});