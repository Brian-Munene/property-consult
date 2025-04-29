document.addEventListener('DOMContentLoaded', function() {
  const header = document.querySelector('.site-header');
  const scrollThreshold = 50; // Number of pixels to scroll before changing navbar style

  window.addEventListener('scroll', function() {
    if (window.scrollY > scrollThreshold) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}); 