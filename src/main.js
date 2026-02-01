import './style.css'
import { renderHeader } from './header.js';
import { Cart } from './cart.js';

// Initial state and data from Backend
let products = [];
const API_URL = 'http://localhost:3001/api';

async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    products = await response.json();
    renderProducts();
  } catch (err) {
    console.error('Error loading productos:', err);
  }
}

// App initialization
document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderHero();
  loadProducts(); // Cargar desde el servidor
  renderFooter();
  Cart.init(); // Initialize reusable cart
  setupEventListeners();
});

function setupEventListeners() {
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart')) {
      const productId = parseInt(e.target.dataset.id);
      const product = products.find(p => p.id === productId);
      if (product) {
        Cart.addItem(product);
      }
    }
  });

  // Sticky header on scroll
  window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

function renderHero() {
  const hero = document.getElementById('hero');
  hero.innerHTML = `
    <div class="hero-content animate-fade">
      <h1>Magia en cada bocado</h1>
      <p>Repostería artesanal creada con amor y los mejores ingredientes.</p>
      <div class="hero-btns">
        <a href="#products" class="btn btn-primary">Ver Catálogo</a>
        <a href="#about" class="btn btn-outline">Nuestra Historia</a>
      </div>
    </div>
  `;
}

function renderProducts() {
  const productsSection = document.getElementById('products');
  productsSection.innerHTML = `
    <h2 class="section-title">Nuestras Delicias</h2>
    <div class="products-grid">
      ${products.map(product => `
        <div class="product-card glass-effect">
          <img src="${product.image}" alt="${product.name}">
          <h3>${product.name}</h3>
          <p class="price">$${product.price.toFixed(2)}</p>
          <button class="btn btn-primary add-to-cart" data-id="${product.id}">Agregar</button>
        </div>
      `).join('')}
    </div>
  `;
}

function renderFooter() {
  const footer = document.getElementById('main-footer');
  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-info">
          <div class="logo">IssaDilly</div>
          <p>Dulzura artesanal desde 2024.</p>
        </div>
        <div class="footer-links">
          <h4>Explorar</h4>
          <ul>
            <li><a href="#products">Productos</a></li>
            <li><a href="#about">Nosotros</a></li>
          </ul>
        </div>
      </div>
      <p class="copyright">&copy; 2024 IssaDilly. Hecho con ❤️ para amantes del dulce.</p>
    </div>
  `;
}
