// ==========================================================================
// Old Time Crank - Main Application & Lightbox Engine
// ==========================================================================
function initMobileMenu() {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      mainNav.classList.toggle('active');
      const isExpanded = mainNav.classList.contains('active');
      menuToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Close menu when clicking outside or on a link
    document.addEventListener('click', (e) => {
      if (!mainNav.contains(e.target) && !menuToggle.contains(e.target) && mainNav.classList.contains('active')) {
        mainNav.classList.remove('active');
      }
    });

    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          mainNav.classList.remove('active');
        }
      });
    });
  }
}

// ==========================================================================
// 2. Global Slideshow Functionality
// ==========================================================================
window.changeSlide = function(slideshowId, direction) {
  const container = document.getElementById(slideshowId);
  if (!container) return;
  const slides = container.querySelectorAll('.slide');
  const dots = container.querySelectorAll('.dot');
  const parent = container.closest('.item-images') || container.parentElement;
  const thumbs = parent ? parent.querySelectorAll('.thumbnails-grid .thumb') : [];
  
  let currentIndex = Array.from(slides).findIndex(slide => slide.classList.contains('active'));
  if (currentIndex === -1) currentIndex = 0;

  slides[currentIndex].classList.remove('active');
  if (dots[currentIndex]) dots[currentIndex].classList.remove('active');
  if (thumbs[currentIndex]) thumbs[currentIndex].classList.remove('active');

  currentIndex += direction;
  if (currentIndex >= slides.length) currentIndex = 0;
  if (currentIndex < 0) currentIndex = slides.length - 1;

  slides[currentIndex].classList.add('active');
  if (dots[currentIndex]) dots[currentIndex].classList.add('active');
  if (thumbs[currentIndex]) thumbs[currentIndex].classList.add('active');
};

window.goToSlide = function(slideshowId, index) {
  const container = document.getElementById(slideshowId);
  if (!container) return;
  const slides = container.querySelectorAll('.slide');
  const dots = container.querySelectorAll('.dot');
  const parent = container.closest('.item-images') || container.parentElement;
  const thumbs = parent ? parent.querySelectorAll('.thumbnails-grid .thumb') : [];

  slides.forEach(slide => slide.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));
  thumbs.forEach(thumb => thumb.classList.remove('active'));

  if (slides[index]) slides[index].classList.add('active');
  if (dots[index]) dots[index].classList.add('active');
  if (thumbs[index]) thumbs[index].classList.add('active');
};

// ==========================================================================
// 3. Graphic Zoom In Lightbox System
// ==========================================================================
class GraphicZoomLightbox {
  constructor() {
    this.currentImages = [];
    this.currentIndex = 0;
    this.currentTitle = 'Product Image';
    this.scale = 1;
    this.minScale = 0.8;
    this.maxScale = 4;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.translateX = 0;
    this.translateY = 0;
    
    this.createLightboxDOM();
    this.attachEventListeners();
    this.bindImageTriggers();
  }

  createLightboxDOM() {
    // Check if modal already exists
    if (document.getElementById('graphic-lightbox-modal')) return;

    const modalHTML = `
      <div id="graphic-lightbox-modal" class="lightbox-modal" role="dialog" aria-modal="true" aria-label="Image Zoom Viewer">
        <header class="lightbox-header">
          <div class="lightbox-title-wrap">
            <h3 class="lightbox-item-title" id="lightbox-title">Antique Phonograph</h3>
            <span class="lightbox-counter" id="lightbox-counter">1 / 1</span>
          </div>
          <div class="lightbox-toolbar">
            <button class="lightbox-tool-btn" id="lb-zoom-in" title="Zoom In (+)">➕</button>
            <button class="lightbox-tool-btn" id="lb-zoom-out" title="Zoom Out (-)">➖</button>
            <button class="lightbox-tool-btn" id="lb-zoom-reset" title="Reset Zoom (100%)">⟲</button>
            <button class="lightbox-tool-btn lightbox-close-btn" id="lb-close" title="Close (Esc)">✕</button>
          </div>
        </header>

        <div class="lightbox-viewport" id="lb-viewport">
          <button class="lightbox-nav-btn prev" id="lb-prev" title="Previous Image (←)">❮</button>
          <div class="lightbox-image-container" id="lb-img-container">
            <img src="" alt="Zoomed Antique View" id="lb-image">
          </div>
          <button class="lightbox-nav-btn next" id="lb-next" title="Next Image (→)">❯</button>
        </div>

        <footer class="lightbox-footer">
          <span class="lightbox-tip">🔍 Scroll mouse wheel or pinch to zoom</span>
          <span class="lightbox-tip">✋ Drag to pan across details</span>
          <span class="lightbox-tip">⌨️ Use Arrow keys & Esc</span>
        </footer>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    this.modal = document.getElementById('graphic-lightbox-modal');
    this.image = document.getElementById('lb-image');
    this.imgContainer = document.getElementById('lb-img-container');
    this.viewport = document.getElementById('lb-viewport');
    this.titleEl = document.getElementById('lightbox-title');
    this.counterEl = document.getElementById('lightbox-counter');
    this.prevBtn = document.getElementById('lb-prev');
    this.nextBtn = document.getElementById('lb-next');
  }

  attachEventListeners() {
    // Toolbar buttons
    document.getElementById('lb-close')?.addEventListener('click', () => this.close());
    document.getElementById('lb-zoom-in')?.addEventListener('click', () => this.zoom(0.3));
    document.getElementById('lb-zoom-out')?.addEventListener('click', () => this.zoom(-0.3));
    document.getElementById('lb-zoom-reset')?.addEventListener('click', () => this.resetTransform());

    // Navigation
    this.prevBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.prev();
    });
    this.nextBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.next();
    });

    // Close on background click
    this.viewport?.addEventListener('click', (e) => {
      if (e.target === this.viewport) {
        this.close();
      }
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      if (!this.modal.classList.contains('active')) return;

      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
      if (e.key === '+' || e.key === '=') this.zoom(0.3);
      if (e.key === '-') this.zoom(-0.3);
      if (e.key === '0') this.resetTransform();
    });

    // Mouse Wheel Zoom
    this.viewport?.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.25 : -0.25;
      this.zoom(delta);
    }, { passive: false });

    // Drag to Pan
    this.viewport?.addEventListener('mousedown', (e) => {
      if (this.scale <= 1) return;
      this.isDragging = true;
      this.startX = e.clientX - this.translateX;
      this.startY = e.clientY - this.translateY;
      this.viewport.classList.add('panning');
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      e.preventDefault();
      this.translateX = e.clientX - this.startX;
      this.translateY = e.clientY - this.startY;
      this.updateTransform();
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.viewport.classList.remove('panning');
      }
    });

    // Click image to toggle zoom
    this.imgContainer?.addEventListener('click', (e) => {
      // If we were dragging, do not toggle zoom
      if (this.wasDragging) {
        this.wasDragging = false;
        return;
      }
      if (this.scale === 1) {
        this.scale = 2.2;
        this.updateTransform();
      }
    });

    // Double click to toggle zoom back and forth
    this.imgContainer?.addEventListener('dblclick', (e) => {
      e.preventDefault();
      if (this.scale > 1) {
        this.resetTransform();
      } else {
        this.scale = 2.5;
        this.updateTransform();
      }
    });

    // Touch events for mobile
    let touchStartDist = 0;
    this.viewport?.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1 && this.scale > 1) {
        this.isDragging = true;
        this.startX = e.touches[0].clientX - this.translateX;
        this.startY = e.touches[0].clientY - this.translateY;
      } else if (e.touches.length === 2) {
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: true });

    this.viewport?.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && this.isDragging) {
        this.translateX = e.touches[0].clientX - this.startX;
        this.translateY = e.touches[0].clientY - this.startY;
        this.updateTransform();
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = (dist - touchStartDist) * 0.005;
        this.zoom(factor);
        touchStartDist = dist;
      }
    }, { passive: true });

    this.viewport?.addEventListener('touchend', () => {
      this.isDragging = false;
    });
  }

  bindImageTriggers() {
    // Find all slideshows and standalone image containers
    const rows = document.querySelectorAll('.item-row');
    rows.forEach(row => {
      const itemTitle = row.querySelector('.item-title')?.textContent.trim() || 'Item Detail';
      const slideshow = row.querySelector('.slideshow-container');
      const mainImg = row.querySelector('.main-image');

      if (slideshow) {
        const slides = slideshow.querySelectorAll('.slide img');
        const imagesList = Array.from(slides).map(img => ({
          src: img.getAttribute('src'),
          alt: img.getAttribute('alt') || itemTitle
        }));

        slides.forEach((img, idx) => {
          img.style.cursor = 'zoom-in';
          img.addEventListener('click', (e) => {
            e.stopPropagation();
            this.open(imagesList, idx, itemTitle);
          });
        });
      } else if (mainImg) {
        const img = mainImg.querySelector('img');
        if (img) {
          img.style.cursor = 'zoom-in';
          const imagesList = [{
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt') || itemTitle
          }];
          img.addEventListener('click', (e) => {
            e.stopPropagation();
            this.open(imagesList, 0, itemTitle);
          });
        }
      }
    });
  }

  open(imagesList, index, title) {
    if (!imagesList || imagesList.length === 0) return;
    this.currentImages = imagesList;
    this.currentIndex = index || 0;
    this.currentTitle = title || 'Antique Detail';

    this.updateImage();
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
    this.resetTransform();
  }

  updateImage() {
    const cur = this.currentImages[this.currentIndex];
    if (!cur) return;

    this.image.src = cur.src;
    this.image.alt = cur.alt || this.currentTitle;
    this.titleEl.textContent = cur.alt || this.currentTitle;
    this.counterEl.textContent = `${this.currentIndex + 1} / ${this.currentImages.length}`;

    if (this.currentImages.length <= 1) {
      this.prevBtn.style.display = 'none';
      this.nextBtn.style.display = 'none';
    } else {
      this.prevBtn.style.display = 'flex';
      this.nextBtn.style.display = 'flex';
    }

    this.resetTransform();
  }

  next() {
    if (this.currentImages.length <= 1) return;
    this.currentIndex = (this.currentIndex + 1) % this.currentImages.length;
    this.updateImage();
  }

  prev() {
    if (this.currentImages.length <= 1) return;
    this.currentIndex = (this.currentIndex - 1 + this.currentImages.length) % this.currentImages.length;
    this.updateImage();
  }

  zoom(delta) {
    const newScale = Math.min(Math.max(this.scale + delta, this.minScale), this.maxScale);
    this.scale = newScale;
    if (this.scale <= 1) {
      this.translateX = 0;
      this.translateY = 0;
    }
    this.updateTransform();
  }

  resetTransform() {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.updateTransform();
  }

  updateTransform() {
    this.imgContainer.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
  }
}

// ==========================================================================
// 4. Sticky Sidebar Active Link Indicator
// ==========================================================================
function initSidebarScrollSpy() {
  const sections = document.querySelectorAll('.item-row');
  const navLinks = document.querySelectorAll('.sidebar-nav a');

  if (sections.length === 0 || navLinks.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, {
    rootMargin: '-20% 0px -65% 0px'
  });

  sections.forEach(sec => observer.observe(sec));
}

// ==========================================================================
// 5. Initialize Everything
// ==========================================================================
function initApp() {
  initMobileMenu();
  new GraphicZoomLightbox();
  initSidebarScrollSpy();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
