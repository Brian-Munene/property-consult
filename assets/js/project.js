document.addEventListener('DOMContentLoaded', function() {
  // Zoom functionality
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  
  // Handle both gallery items and project gallery images
  const allZoomableImages = document.querySelectorAll('.gallery-item img, .project-gallery img');

  allZoomableImages.forEach(img => {
    img.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent event bubbling
      modal.classList.add('active');
      modalImg.src = this.src;
    });
  });

  modal.addEventListener('click', function() {
    modal.classList.remove('active');
  });

  // Close on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
    }
  });
});