document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  
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
        section.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // Mobile menu handling
  const createMobileMenu = () => {
    if (!document.querySelector('.menu-toggle')) {
      const menuToggle = document.createElement('button');
      menuToggle.className = 'menu-toggle';
      menuToggle.innerHTML = '☰';
      menuToggle.style.cssText = `
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        display: none;
        padding: 0.5rem;
      `;
      
      const nav = document.querySelector('nav');
      nav.parentNode.insertBefore(menuToggle, nav);

      menuToggle.addEventListener('click', () => {
        const navList = document.querySelector('.nav-list');
        navList.classList.toggle('active');
      });

      // Show/hide menu toggle based on screen size
      const checkScreenSize = () => {
        menuToggle.style.display = window.innerWidth <= 768 ? 'block' : 'none';
      };

      window.addEventListener('resize', checkScreenSize);
      checkScreenSize(); // Initial check
    }
  };

  createMobileMenu();
});