document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navList = document.querySelector('.nav-list');

  // Handle scroll effects
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Smooth scroll to sections when clicking nav links
  document.querySelectorAll('.nav-list a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const section = document.querySelector(this.getAttribute('href'));
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
      // Close menu after click (for mobile/tablet)
      if (navList && menuToggle && window.innerWidth <= 900) {
        navList.classList.remove('active');
      }
    });
  });

  // Menu toggle logic for mobile/tablet
  if (menuToggle && navList) {
    menuToggle.addEventListener('click', () => {
      navList.classList.toggle('active');
    });
  }
});

// Diaspora Carousel Functionality
(function() {
  const carousel = document.querySelector('.diaspora-carousel');
  if (!carousel) return;
  const items = carousel.querySelectorAll('.diaspora-carousel-item');
  const prevBtn = carousel.querySelector('.diaspora-carousel-control.prev');
  const nextBtn = carousel.querySelector('.diaspora-carousel-control.next');
  
  // Exit early if required elements are missing
  if (!items.length || !prevBtn || !nextBtn) {
    console.warn('Carousel initialization failed: missing required elements');
    return;
  }
  
  let currentIndex = 0;

  function showSlide(index) {
    items.forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % items.length;
    showSlide(currentIndex);
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    showSlide(currentIndex);
  }

  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);

  // Auto-rotate every 5 seconds
  setInterval(nextSlide, 5000);
})();