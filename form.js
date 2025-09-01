// ===================== //
// FUNCIONALIDAD GENERAL //
// ===================== //
document.addEventListener('DOMContentLoaded', function() {
    try { initCarouselCertificados(); } catch(e) { console.error(e); }
    try { initCarouselProyectos(); } catch(e) { console.error(e); }
    try { initFormValidation(); } catch(e) { console.error(e); }
    try { initLightbox(); } catch(e) { console.error(e); }
    try { initSmoothScrolling(); } catch(e) { console.error(e); }
});

// ===================== //
// Fallback GENERICO Vanilla JS para Carrousels (¡AHORA CON AUTOPLAY!) //
// ===================== //
function setupBasicCarousel(carouselElement, slidesToShowDefault = 3, autoplay = false) {
    const track = carouselElement.querySelector('.carousel-track');
    const items = carouselElement.querySelectorAll('.carousel-item');
    const prevBtn = carouselElement.querySelector('.carousel-prev');
    const nextBtn = carouselElement.querySelector('.carousel-next');
    if (!track || items.length === 0) return;
    let currentIndex = 0;
    let autoplayTimer = null;

    function getVisibleSlides() {
        if (window.innerWidth < 768) return 1;
        if (window.innerWidth < 1024) return 2;
        return slidesToShowDefault;
    }

    function updateCarousel() {
        const visibleSlides = getVisibleSlides();
        const itemWidth = items[0].offsetWidth;
        track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
        if (prevBtn) prevBtn.disabled = currentIndex === 0;
        if (nextBtn) nextBtn.disabled = currentIndex >= items.length - visibleSlides;
    }

    function goToNext() {
        const visibleSlides = getVisibleSlides();
        if (currentIndex < items.length - visibleSlides) {
            currentIndex++;
        } else {
            currentIndex = 0; // Autoplay: vuelve al inicio
        }
        updateCarousel();
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });
        nextBtn.addEventListener('click', goToNext);
    }

    window.addEventListener('resize', updateCarousel);
    updateCarousel();
}




// carousel.js

document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.projects-carousel');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
  
    const scrollAmount = carousel.offsetWidth * 0.8;
  
    prevBtn.addEventListener('click', () => {
      carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
  
    nextBtn.addEventListener('click', () => {
      carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
  });



// ===================== //
// CARRUSEL DE CERTIFICADOS //
// ===================== //
function initCarouselCertificados() {
    const carousel = document.querySelector('.carousel-container');
    if (!carousel) return;
    // Con Slick
    if (typeof jQuery !== 'undefined' && jQuery.fn.slick) {
        $(carousel).slick({
            dots: true,
            arrows: true,
            infinite: true,
            speed: 300,
            slidesToShow: 3,
            slidesToScroll: 1,
            centerMode: true,
            centerPadding: '60px',
            autoplay: true,           // AUTOPLAY EN SLICK
            autoplaySpeed: 5000,      // 5 segundos
            responsive: [
                { breakpoint: 1024, settings: { slidesToShow: 2, centerPadding: '40px' } },
                { breakpoint: 768,  settings: { slidesToShow: 1, centerPadding: '20px', arrows: false } }
            ]
        });
    } else {
        setupBasicCarousel(carousel, 3, 5000); // AUTOPLAY cada 5 segundos para fallback
    }
}



// ===================== //
// LIGHTBOX PARA CERTIFICADOS //
// ===================== //
function initLightbox() {
    document.body.addEventListener('click', function(e) {
        const img = e.target.closest('.certificate-image');
        if (!img) return;
        // Crear lightbox
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.tabIndex = 0;
        // Imagen ampliada
        const fullImg = document.createElement('img');
        fullImg.src = img.src;
        fullImg.alt = img.alt || 'Certificado ampliado';
        // Botón de cerrar accesible
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.className = 'lightbox-close';
        closeBtn.type = 'button';
        closeBtn.setAttribute('aria-label', 'Cerrar');
        // Cierre seguro
        function handleKeyDown(e) { if (e.key === 'Escape') closeLightbox(); }
        function closeLightbox() {
            if (document.body.contains(lightbox)) {
                document.body.removeChild(lightbox);
                document.removeEventListener('keydown', handleKeyDown);
            }
        }
        closeBtn.addEventListener('click', closeLightbox);
        lightbox.appendChild(closeBtn);
        lightbox.appendChild(fullImg);
        document.body.appendChild(lightbox);
        lightbox.focus();
        // Cerrar al hacer clic fuera de la imagen
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener('keydown', handleKeyDown);
    });
}

// ===================== //
// VALIDACIÓN DE FORMULARIO MEJORADA //
// ===================== //
function initFormValidation() {
    const form = document.getElementById('myForm');
    if (!form) return;
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formMessage = document.getElementById('form-message');
        const submitBtn = form.querySelector('button[type="submit"]');
        // Validar campos
        const error = validateForm(form);
        if (error) {
            showFormMessage(formMessage, error, 'error');
            return;
        }
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        try {
            const response = await sendFormData(form);
            if (response.ok) {
                showFormMessage(formMessage, '✅ Mensaje enviado con éxito', 'success');
                form.reset();
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || response.statusText || 'Error al enviar');
            }
        } catch (error) {
            showFormMessage(formMessage, `❌ ${error.message}`, 'error');
            console.error('Error al enviar el formulario:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Enviar";
        }
    });
    // Validación en tiempo real
    form.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('blur', function() {
            // Limpiar error si existe
            const errorElement = this.parentElement.querySelector('.error-message');
            const error = validateField(this);
            if (errorElement) {
                errorElement.textContent = error || '';
            } else if (error) {
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.textContent = error;
                this.insertAdjacentElement('afterend', errorMsg);
            }
        });
    });
}

function validateForm(form) {
    const nameInput = form.querySelector("input[name='name']");
    const emailInput = form.querySelector("input[type='email']");
    const messageInput = form.querySelector("textarea[name='message']");
    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';
    if (!name) return "Por favor ingresa tu nombre.";
    if (!email) return "Por favor ingresa tu correo electrónico.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Por favor ingresa un correo válido.";
    if (!message) return "Por favor escribe un mensaje.";
    if (message.length < 10) return "El mensaje debe tener al menos 10 caracteres.";
    return null;
}

function validateField(field) {
    const value = field.value.trim();
    if (field.required && !value) {
        return `El campo ${field.name} es requerido`;
    }
    if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Por favor ingresa un correo válido';
    }
    if (field.name === 'message' && value.length < 10) {
        return 'El mensaje debe tener al menos 10 caracteres';
    }
    return null;
}

async function sendFormData(form) {
    const formData = new FormData(form);
    return await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
    });
}

function showFormMessage(container, message, type) {
    if (!container) return;
    container.innerHTML = `<div class="${type}-message">${message}</div>`;
    if (type === 'error') {
        setTimeout(() => {
            container.innerHTML = '';
        }, 5000);
    }
}

// ===================== //
// SCROLL SUAVE //
// ===================== //
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId.length === 1) return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===================== //
// ANIMACIONES ADICIONALES //
// ===================== //
function initAnimations() {
    document.querySelectorAll('.skill').forEach((skill, index) => {
        skill.style.animationDelay = `${index * 0.1}s`;
        skill.classList.add('animate__animated', 'animate__fadeInUp');
    });
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated', 'animate__fadeIn');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.card, .section-title').forEach(el => {
        observer.observe(el);
    });
}

if (document.readyState === 'complete') {
    initAnimations();
} else {
    window.addEventListener('load', initAnimations, { once: true });
}
