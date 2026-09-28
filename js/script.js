// =========================================
// 1. MENÚ MÓVIL (abrir/cerrar)
// =========================================
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Cierra el menú al hacer clic en un enlace (útil en móvil)
navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});

// =========================================
// 2. NAVEGACIÓN TRANSPARENTE → SÓLIDA AL HACER SCROLL
//    (imita el efecto de sitios como visitgreenland.com: el menú
//    flota transparente sobre el hero y se vuelve sólido al bajar)
// =========================================
const header = document.getElementById('header');

const updateHeaderOnScroll = () => {
  if (window.scrollY > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
};

window.addEventListener('scroll', updateHeaderOnScroll);
updateHeaderOnScroll(); // por si la página se carga ya con scroll (ej. al recargar)

// =========================================
// 3. AÑO DINÁMICO EN EL FOOTER
// =========================================
document.getElementById('year').textContent = new Date().getFullYear();

// =========================================
// 4. BOTÓN "VOLVER ARRIBA"
// =========================================
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 400) {
    backToTopBtn.classList.add('visible');
  } else {
    backToTopBtn.classList.remove('visible');
  }
});

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// =========================================
// 5. ANIMACIÓN DE ELEMENTOS AL HACER SCROLL
//    (usa IntersectionObserver, una API nativa del navegador)
// =========================================
const revealElements = document.querySelectorAll('.section, .card, .about-media, .about-text, .newsletter, .tour-route, .tours-nav');
revealElements.forEach((el) => el.classList.add('reveal'));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  },
  // threshold bajo: algunas secciones (p. ej. los tours de Puerto Sánchez) son
  // más altas que el viewport, así que exigir un % grande de su área visible
  // (como el 0.15 anterior) podía no cumplirse nunca y dejar el bloque oculto
  // para siempre. Con "any" basta con que un pixel entre en pantalla.
  { threshold: 0 }
);

revealElements.forEach((el) => observer.observe(el));

// Red de seguridad: si por cualquier razón el observer no llega a activar
// un bloque (viewport atípico, recarga a mitad de scroll, etc.), lo
// mostramos igual pasado un momento para que el contenido nunca quede
// oculto para siempre.
setTimeout(() => {
  revealElements.forEach((el) => el.classList.add('active'));
}, 2000);

// =========================================
// 5b. CARRUSELES DE DESTINO (PATAGONIA / SAN PEDRO DE ATACAMA)
// =========================================
document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  const prevBtn = carousel.querySelector('.carousel-btn--prev');
  const nextBtn = carousel.querySelector('.carousel-btn--next');
  const dotsContainer = carousel.querySelector('.carousel-dots');
  const hasVideo = carousel.querySelector('video') !== null;
  let currentIndex = 0;

  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Ir a la foto ${index + 1}`);
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.querySelectorAll('.carousel-dot'));

  function goToSlide(index) {
    currentIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    // Pausa cualquier video que quede fuera de vista al cambiar de slide
    slides.forEach((slide, i) => {
      const video = slide.querySelector('video');
      if (video && i !== currentIndex) video.pause();
    });
  }

  prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

  // Los carruseles con video no avanzan solos, para no interrumpir la reproducción
  if (!hasVideo) {
    let autoplay = setInterval(() => goToSlide(currentIndex + 1), 5000);
    carousel.addEventListener('mouseenter', () => clearInterval(autoplay));
    carousel.addEventListener('mouseleave', () => {
      autoplay = setInterval(() => goToSlide(currentIndex + 1), 5000);
    });
  }
});

// =========================================
// 6. FORMULARIO DE CONTACTO: VALIDACIÓN + ENVÍO A tuchilecl@gmail.com (EmailJS)
// =========================================
const EMAILJS_PUBLIC_KEY = 'p9oCF4m3wNGR-6yxP';
const EMAILJS_SERVICE_ID = 'tuchilecl_26';
const EMAILJS_CONTACT_TEMPLATE_ID = 'template_dt3n0ao';

if (typeof emailjs !== 'undefined') {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

const contactForm = document.getElementById('contactForm');
const formFeedback = document.getElementById('formFeedback');

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const mensaje = document.getElementById('mensaje').value.trim();

    if (!nombre || !email || !mensaje) {
      formFeedback.textContent = translate('feedback.formIncomplete');
      formFeedback.className = 'form-feedback error';
      return;
    }

    if (typeof emailjs === 'undefined') {
      formFeedback.textContent = translate('feedback.formError');
      formFeedback.className = 'form-feedback error';
      return;
    }

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_CONTACT_TEMPLATE_ID, {
      name: nombre,
      email: email,
      message: mensaje,
    })
      .then(() => {
        formFeedback.textContent = translate('feedback.formSuccess').replace('{name}', nombre);
        formFeedback.className = 'form-feedback success';
        contactForm.reset();
      })
      .catch((error) => {
        console.error('Error al enviar el formulario de contacto:', error);
        formFeedback.textContent = translate('feedback.formError');
        formFeedback.className = 'form-feedback error';
      })
      .finally(() => {
        if (submitBtn) submitBtn.disabled = false;
      });
  });
}

// =========================================
// 7. NEWSLETTER: VALIDACIÓN + CORREO AUTOMÁTICO DE BIENVENIDA (EmailJS)
// =========================================
const EMAILJS_NEWSLETTER_TEMPLATE_ID = 'template_iycdgye';

const newsletterForm = document.getElementById('newsletterForm');
const newsletterFeedback = document.getElementById('newsletterFeedback');

if (newsletterForm) {
  newsletterForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const emailInput = newsletterForm.querySelector('input[type="email"]');
    const email = emailInput.value.trim();

    if (!email) {
      newsletterFeedback.textContent = translate('feedback.newsletterInvalid');
      newsletterFeedback.className = 'form-feedback error';
      return;
    }

    if (typeof emailjs === 'undefined') {
      newsletterFeedback.textContent = translate('feedback.newsletterError');
      newsletterFeedback.className = 'form-feedback error';
      return;
    }

    const submitBtn = newsletterForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_NEWSLETTER_TEMPLATE_ID, { email })
      .then(() => {
        newsletterFeedback.textContent = translate('feedback.newsletterSuccess');
        newsletterFeedback.className = 'form-feedback success';
        newsletterForm.reset();
      })
      .catch((error) => {
        console.error('Error al enviar el correo de bienvenida:', error);
        newsletterFeedback.textContent = translate('feedback.newsletterError');
        newsletterFeedback.className = 'form-feedback error';
      })
      .finally(() => {
        if (submitBtn) submitBtn.disabled = false;
      });
  });
}
