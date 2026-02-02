export function renderHeader() {
  const header = document.getElementById('main-header');
  if (!header) return;

  const user = JSON.parse(localStorage.getItem('issadilly_user'));

  let authLinks;
  if (user) {
    authLinks = `
      <li class="dropdown">
        <span class="dropdown-trigger">Hola, ${user.name.split(' ')[0]}</span>
        <div class="dropdown-content">
          <a href="profile.html#personal" style="font-weight: bold; color: var(--accent-gold);">Mi Perfil</a>
          <a href="profile.html#address">Mi Dirección</a>
          <a href="profile.html#payment">Métodos de Pago</a>
          <a href="profile.html#invoices">Facturas</a>
          <a href="profile.html#history">Historial</a>
          <a href="profile.html#security">Seguridad</a>
          ${user.role === 'admin' ? '<a href="admin.html" style="color: var(--accent-gold); font-weight: bold;">Panel Admin</a>' : ''}
          <a href="#" onclick="logout()" style="border-top: 1px solid var(--glass-border); color: #e74c3c;">Salir</a>
        </div>
      </li>
    `;
  } else {
    authLinks = `
      <li><a href="login.html">Acceder / Registro</a></li>
    `;
  }

  header.innerHTML = `
    <nav class="container">
      <div class="logo">IssaDilly</div>
      
      <!-- Mobile Menu Button -->
      <div class="mobile-menu-btn" onclick="toggleMobileMenu()">☰</div>

      <div class="nav-wrapper" id="nav-wrapper">
        <ul class="nav-links main-nav">
          <li><a href="index.html#hero" onclick="closeMobileMenu()">Inicio</a></li>
          <li><a href="index.html#products" onclick="closeMobileMenu()">Productos</a></li>
          <li><a href="index.html#about" onclick="closeMobileMenu()">Nosotros</a></li>
        </ul>
        <ul class="nav-links auth-nav">
          ${authLinks}
        </ul>
      </div>
      <div class="cart-icon" id="cart-btn">
        <span id="cart-count">0</span>
        🛒
      </div>
    </nav>
  `;

  // Inject WhatsApp Button directly to body to avoid header positioning context issues
  if (!document.querySelector('.whatsapp-float')) {
    const waBtn = document.createElement('a');
    waBtn.href = "https://wa.me/525512345678";
    waBtn.className = "whatsapp-float";
    waBtn.target = "_blank";
    waBtn.innerHTML = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>`;
    document.body.appendChild(waBtn);
  }

  // Update cart count
  const cart = JSON.parse(localStorage.getItem('issadilly_cart')) || [];
  const countSpan = document.getElementById('cart-count');
  if (countSpan) countSpan.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);
}

// Mobile Menu Logic
window.toggleMobileMenu = () => {
  const navWrapper = document.getElementById('nav-wrapper');
  navWrapper.classList.toggle('active');
};

window.closeMobileMenu = () => {
  const navWrapper = document.getElementById('nav-wrapper');
  navWrapper.classList.remove('active');
};

// Global logout function
window.logout = () => {
  localStorage.removeItem('issadilly_token');
  localStorage.removeItem('issadilly_user');
  window.location.href = '/';
};
