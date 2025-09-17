// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {

  // 1. Menú Hamburguesa
  const menuToggle = document.getElementById('menu-toggle');
  const menuOverlay = document.querySelector('.menu-overlay');
  const menuLinks = document.querySelectorAll('.menu-link');
  const menuBtn = document.querySelector('.menu-btn');

  // Cerrar menú al hacer clic en el overlay
  menuOverlay.addEventListener('click', () => {
    menuToggle.checked = false;
  });

  // Cerrar menú al hacer clic en un enlace
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.checked = false;
    });
  });

  // Cerrar menú con la tecla Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuToggle.checked) {
      menuToggle.checked = false;
    }
  });

  // Actualizar aria-expanded
  menuToggle.addEventListener('change', () => {
    menuBtn.setAttribute('aria-expanded', menuToggle.checked);
  });
  
  // 2. Carga de Servicios Semanales (Nuevo)
  const servicesContainer = document.getElementById('services-container');

  async function loadServices() {
    servicesContainer.innerHTML = '<div class="services-loading">Cargando servicios...</div>';
    try {
      const response = await fetch('data/services.json');
      if (!response.ok) throw new Error('Error al cargar los servicios');
      const services = await response.json();
      
      servicesContainer.innerHTML = '';
      
      services.forEach(service => {
        const serviceItem = document.createElement('div');
        serviceItem.classList.add('service-item');
        serviceItem.innerHTML = `
          <div class="service-icon"><i class="${service.icon}"></i></div>
          <h3>${service.title}</h3>
          <p>${service.time}</p>
        `;
        servicesContainer.appendChild(serviceItem);
      });
      
    } catch (error) {
      servicesContainer.innerHTML = `
        <div class="service-error">
          <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
          <p>No se pudieron cargar los servicios. Intenta de nuevo más tarde.</p>
        </div>
      `;
    }
  }

  // 3. Carga de Eventos
  const eventsContainer = document.getElementById('events-container');

  async function loadEvents() {
    eventsContainer.innerHTML = '<div class="event-loading">Cargando eventos...</div>';
    try {
      const response = await fetch('data/events.json');
      if (!response.ok) throw new Error('Error al cargar los eventos');
      const events = await response.json();

      eventsContainer.innerHTML = '';

      const scheduledEvents = events.filter(event => event.status === 'scheduled');
      if (scheduledEvents.length === 0) {
        eventsContainer.innerHTML = '<p>No hay eventos programados en este momento. ¡Pronto tendremos más!</p>';
        return;
      }
      
      scheduledEvents.forEach(event => {
        const eventItem = document.createElement('div');
        eventItem.classList.add('event-item');
        
        const eventDate = new Date(event.start);
        const day = eventDate.getDate();
        const month = eventDate.toLocaleString('es-ES', { month: 'short' }).toUpperCase().replace('.', '');
        
        eventItem.innerHTML = `
          <div class="event-date">
            <span class="day">${day}</span>
            <span class="month">${month}</span>
          </div>
          <div class="event-details">
            <h3>${event.title}</h3>
            <p><i class="fas fa-clock" aria-hidden="true"></i> ${eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
            <p><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${event.location.name}</p>
          </div>
        `;
        eventItem.addEventListener('click', () => openEventModal(event));
        eventsContainer.appendChild(eventItem);
      });
      
    } catch (error) {
      eventsContainer.innerHTML = `
        <div class="event-error">
          <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
          <p>No se pudieron cargar los eventos. Intenta de nuevo más tarde.</p>
        </div>
      `;
    }
  }

  // Modal de eventos (mejorado)
  function openEventModal(event) {
    const modal = document.createElement('div');
    modal.classList.add('event-modal');
    
    const eventStartDate = new Date(event.start);
    const eventEndDate = new Date(event.end);
    
    modal.innerHTML = `
      <div class="event-modal-content">
        <button class="close-modal" aria-label="Cerrar modal"><i class="fas fa-times"></i></button>
        <div class="event-modal-header">
          <h2>${event.title}</h2>
        </div>
        <img src="${event.image.url}" alt="${event.image.alt}" class="event-image">
        <div class="event-details">
          <p><i class="fas fa-calendar" aria-hidden="true"></i> ${eventStartDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p><i class="fas fa-clock" aria-hidden="true"></i> ${eventStartDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${eventEndDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
          <p><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${event.location.address}</p>
        </div>
        <div class="event-description">
          <p>${event.description}</p>
        </div>
        <div class="event-actions">
          <a href="${event.registration_url}" class="btn" target="_blank">Asistir</a>
          <button class="btn btn-share" data-event-id="${event.id}">
            <i class="fas fa-share" aria-hidden="true"></i> Compartir
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Animar la apertura
    setTimeout(() => modal.classList.add('active'), 10);

    // Cerrar modal
    const closeModal = modal.querySelector('.close-modal');
    closeModal.addEventListener('click', () => {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    });

    // Cerrar con clic fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
      }
    });

    // Cerrar con Esc
    document.addEventListener('keydown', function closeOnEsc(e) {
      if (e.key === 'Escape') {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
        document.removeEventListener('keydown', closeOnEsc);
      }
    });

    // Compartir evento
    const shareBtn = modal.querySelector('.btn-share');
    shareBtn.addEventListener('click', () => {
      const shareUrl = `${window.location.origin}/#event-${event.id}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('¡Enlace copiado al portapapeles!');
      });
    });
  }

  // Cargar servicios y eventos al iniciar
  loadServices();
  loadEvents();
  
  // 4. Galería Dinámica
  const galleryModal = document.getElementById('gallery-modal');
  const modalImage = document.getElementById('modal-image');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const closeModalGallery = document.querySelector('.close-modal-gallery');

  let currentImages = [];
  let currentIndex = 0;
  
  const allImages = document.querySelectorAll('.carousel-wrapper img');
  currentImages = Array.from(allImages).map(img => img.src);

  function openGalleryModal(imageSrc) {
    modalImage.src = imageSrc;
    galleryModal.style.display = "flex";
    currentIndex = currentImages.indexOf(imageSrc);
  }

  function showNextImage() {
    currentIndex = (currentIndex + 1) % currentImages.length;
    modalImage.src = currentImages[currentIndex];
  }

  function showPrevImage() {
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    modalImage.src = currentImages[currentIndex];
  }

  // Abrir modal al hacer clic en cualquier imagen de la galería
  allImages.forEach(img => {
    img.addEventListener('click', () => {
      openGalleryModal(img.src);
    });
  });

  // Navegar con los botones
  nextBtn.addEventListener('click', showNextImage);
  prevBtn.addEventListener('click', showPrevImage);

  // Cerrar modal
  closeModalGallery.addEventListener('click', () => {
    galleryModal.style.display = "none";
  });

  // Cerrar al hacer clic fuera del contenido de la imagen
  window.addEventListener('click', (event) => {
    if (event.target === galleryModal) {
      galleryModal.style.display = "none";
    }
  });

  // Navegar con las teclas de flecha
  document.addEventListener('keydown', (e) => {
    if (galleryModal.style.display === "flex") {
      if (e.key === 'ArrowRight') {
        showNextImage();
      } else if (e.key === 'ArrowLeft') {
        showPrevImage();
      } else if (e.key === 'Escape') {
        galleryModal.style.display = "none";
      }
    }
  });

  // 5. Formulario de Contacto (enviar por WhatsApp)
  const contactForm = document.getElementById('contact-form');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = contactForm.querySelector('#name').value.trim();
    const phone = contactForm.querySelector('#phone').value.trim();
    const message = contactForm.querySelector('#message').value.trim();
    const myPhoneNumber = '521234567890'; // Reemplaza con tu número de WhatsApp

    // Validación mejorada
    const phoneRegex = /^\+?(\d{1,3})?[-.\s]?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})$/;
    
    if (name.length < 3) {
        alert('Por favor, ingresa tu nombre completo.');
        return;
    }
    
    if (!phoneRegex.test(phone)) {
        alert('Por favor, ingresa un número de teléfono válido.');
        return;
    }
    
    if (message.length < 10) {
        alert('Por favor, ingresa un mensaje más detallado (mínimo 10 caracteres).');
        return;
    }

    const fullMessage = `Hola, mi nombre es ${name}. Te escribo desde la página web. Mensaje: ${message}. Mi teléfono es ${phone}.`;
    const whatsappUrl = `https://wa.me/${myPhoneNumber}?text=${encodeURIComponent(fullMessage)}`;
    
    window.open(whatsappUrl, '_blank');
    contactForm.reset();
  });

  // 6. Formulario de Donación (simulado)
  const donationForm = document.getElementById('donation-form');
  donationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = donationForm.querySelector('#amount').value;
    const donorName = donationForm.querySelector('#donor-name').value.trim();
    const donorPhone = donationForm.querySelector('#donor-phone').value.trim();
    const cardNumber = donationForm.querySelector('#card-number').value.trim();
    const expiryDate = donationForm.querySelector('#expiry-date').value.trim();
    const cvv = donationForm.querySelector('#cvv').value.trim();
    
    if (!amount || !donorName || !donorPhone || !cardNumber || !expiryDate || !cvv) {
      alert('Por favor, completa todos los campos del formulario de donación.');
      return;
    }

    // Lógica simulada de procesamiento de pago
    alert(`Donación de $${amount} procesada con éxito a nombre de ${donorName}. ¡Muchas gracias por tu generosidad!`);
    donationForm.reset();
  });

  // 7. Actualizar Año en el Footer
  document.getElementById('current-year').textContent = new Date().getFullYear();

});
