// ===================== //
// FUNCIONALIDAD GENERAL //
// ===================== //
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes
    initCarousel(); // Carrusel de certificados
    initProjectsCarousel(); // Carrusel de proyectos
    initFormValidation();
    initLightbox();
    initSmoothScrolling();
});

// ===================== //
// CARRUSEL DE CERTIFICADOS - VERSIÓN MEJORADA //
// ===================== //
function initCarousel() {
    const carousel = document.querySelector('.carousel-container');
    
    if (carousel && typeof jQuery !== 'undefined' && jQuery.fn.slick) {
        $(carousel).slick({
            dots: true,
            arrows: true,
            infinite: true,
            speed: 300,
            slidesToShow: 3,
            slidesToScroll: 1,
            centerMode: true,
            centerPadding: '60px',
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 2,
                        centerPadding: '40px'
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1,
                        centerPadding: '20px',
                        arrows: false
                    }
                }
            ]
        });

        // Pausar auto-desplazamiento al interactuar
        let autoplay = setInterval(() => {
            $(carousel).slick('slickNext');
        }, 5000);

        carousel.addEventListener('mouseenter', () => clearInterval(autoplay));
        carousel.addEventListener('mouseleave', () => {
            autoplay = setInterval(() => {
                $(carousel).slick('slickNext');
            }, 5000);
        });
    } else if (carousel) {
        // Fallback básico si Slick no está disponible
        setupBasicCarousel();
    }
}

// ===================== //
// CARRUSEL DE PROYECTOS //
// ===================== //
function initProjectsCarousel() {
    const projectsCarousel = document.querySelector('.projects-carousel');
    
    if (projectsCarousel && typeof jQuery !== 'undefined' && jQuery.fn.slick) {
        $(projectsCarousel).slick({
            dots: true,
            arrows: true,
            infinite: false,
            speed: 400,
            slidesToShow: 3,
            slidesToScroll: 1,
            adaptiveHeight: true,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 2,
                        arrows: true,
                        dots: true
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1,
                        arrows: false,
                        dots: true,
                        centerMode: true,
                        centerPadding: '40px'
                    }
                }
            ]
        });
    }
}

// Fallback para carrusel sin jQuery/Slick
function setupBasicCarousel() {
    const track = document.querySelector('.carousel-track');
    const items = document.querySelectorAll('.carousel-item');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    
    if (!track || items.length === 0) return;
    
    let currentIndex = 0;
    const itemWidth = items[0].offsetWidth;
    
    function updateCarousel() {
        track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= items.length - 3;
    }
    
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (currentIndex < items.length - 3) {
                currentIndex++;
                updateCarousel();
            }
        });
    }
    
    updateCarousel();
}

// ===================== //
// LIGHTBOX PARA CERTIFICADOS //
// ===================== //
function initLightbox() {
    document.querySelectorAll('.certificate-image').forEach(img => {
        img.addEventListener('click', function() {
            // Crear lightbox
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            
            // Crear imagen ampliada
            const fullImg = document.createElement('img');
            fullImg.src = this.src;
            fullImg.alt = this.alt || 'Certificado ampliado';
            
            // Botón de cerrar
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '&times;';
            closeBtn.className = 'lightbox-close';
            closeBtn.addEventListener('click', () => document.body.removeChild(lightbox));
            
            // Controles de navegación
            const controls = document.createElement('div');
            controls.className = 'lightbox-controls';
            
            lightbox.appendChild(closeBtn);
            lightbox.appendChild(fullImg);
            lightbox.appendChild(controls);
            document.body.appendChild(lightbox);
            
            // Cerrar al hacer clic fuera de la imagen
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    document.body.removeChild(lightbox);
                }
            });
            
            // Cerrar con tecla ESC
            document.addEventListener('keydown', function handleKeyDown(e) {
                if (e.key === 'Escape') {
                    document.body.removeChild(lightbox);
                    document.removeEventListener('keydown', handleKeyDown);
                }
            });
        });
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
        
        // Cambiar estado del botón
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
            const error = validateField(this);
            const errorElement = this.nextElementSibling;
            
            if (errorElement && errorElement.classList.contains('error-message')) {
                if (error) {
                    errorElement.textContent = error;
                } else {
                    errorElement.textContent = '';
                }
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
    const name = form.querySelector("input[name='name']").value.trim();
    const email = form.querySelector("input[type='email']").value.trim();
    const message = form.querySelector("textarea[name='message']").value.trim();
    
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
        headers: {
            'Accept': 'application/json'
        }
    });
}

function showFormMessage(container, message, type) {
    if (!container) return;
    
    container.innerHTML = `<div class="${type}-message">${message}</div>`;
    
    // Eliminar mensaje después de 5 segundos
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
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
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
    // Animación de habilidades
    const skills = document.querySelectorAll('.skill');
    skills.forEach((skill, index) => {
        skill.style.animationDelay = `${index * 0.1}s`;
        skill.classList.add('animate__animated', 'animate__fadeInUp');
    });
    
    // Intersection Observer para animaciones al hacer scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated', 'animate__fadeIn');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.card, .section-title').forEach(el => {
        observer.observe(el);
    });
}

// Inicializar animaciones cuando el DOM esté listo
if (document.readyState === 'complete') {
    initAnimations();
} else {
    window.addEventListener('load', initAnimations);
}
