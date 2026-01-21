import './style.css'

const products = [
  {
    id: 1,
    title: "Edison Standard Model D",
    category: "Phonograph",
    price: "$1,250.00",
    image: "https://images.unsplash.com/photo-1546521677-b3a9b117818c?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Victor Talking Machine",
    category: "Gramophone",
    price: "$2,400.00",
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a11d0?q=80&w=2069&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Blue Amberol Cylinders (Set of 5)",
    category: "Media",
    price: "$125.00",
    image: "https://images.unsplash.com/photo-1621360841013-c768371e93cf?q=80&w=1974&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "Morning Glory Horn",
    category: "Accessories",
    price: "$350.00",
    image: "https://plus.unsplash.com/premium_photo-1682125773446-259ce64f9dd7?q=80&w=2071&auto=format&fit=crop"
  }
];

document.querySelector('#product-grid').innerHTML = products.map(product => `
  <div class="product-card">
    <div class="product-image">
      <img src="${product.image}" alt="${product.title}">
    </div>
    <div class="product-info">
      <span class="product-category">${product.category}</span>
      <h3 class="product-title">${product.title}</h3>
      <div class="product-price">${product.price}</div>
    </div>
  </div>
`).join('');

// Simple Mobile Menu Toggle
const menuToggle = document.querySelector('.mobile-menu-toggle');
const mainNav = document.querySelector('.main-nav');

menuToggle.addEventListener('click', () => {
  mainNav.classList.toggle('active');
  const isExpanded = mainNav.classList.contains('active');
  menuToggle.setAttribute('aria-expanded', isExpanded);
});

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
