export const Cart = {
    items: [],

    init() {
        this.items = JSON.parse(localStorage.getItem('issadilly_cart')) || [];
        this.updateCount();
        this.setupListeners();
    },

    setupListeners() {
        document.addEventListener('click', (e) => {
            // Toggle Modal (Cart Icon)
            if (e.target.id === 'cart-btn' || e.target.closest('#cart-btn')) {
                this.toggleModal();
            }
            // Close Modal (Overlay or X button)
            if (e.target.classList.contains('close-modal') || e.target.id === 'cart-modal') {
                this.toggleModal();
            }
            // Remove Item
            if (e.target.classList.contains('remove-item')) {
                this.removeItem(parseInt(e.target.dataset.id));
            }
            // Checkout
            if (e.target.classList.contains('checkout-btn')) {
                alert('¡Gracias por tu compra! (Simulación)');
                this.items = [];
                this.save();
                this.updateCount();
                this.toggleModal();
            }
        });
    },

    addItem(product) {
        const existing = this.items.find(i => i.id === product.id);
        if (existing) {
            existing.quantity++;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }
        this.save();
        this.updateCount();
        this.showToast(`${product.name} añadido al carrito`);
    },

    removeItem(id) {
        this.items = this.items.filter(i => i.id !== id);
        this.save();
        this.updateCount();
        this.render();
    },

    save() {
        localStorage.setItem('issadilly_cart', JSON.stringify(this.items));
    },

    updateCount() {
        const count = this.items.reduce((acc, i) => acc + i.quantity, 0);
        const el = document.getElementById('cart-count');
        if (el) el.textContent = count;
    },

    toggleModal() {
        const modal = document.getElementById('cart-modal');
        if (!modal) return;
        modal.classList.toggle('active');
        if (modal.classList.contains('active')) {
            this.render();
        }
    },

    render() {
        const modal = document.getElementById('cart-modal');
        if (!modal) return;

        const total = this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        modal.innerHTML = `
        <div class="modal-content glass-effect">
          <span class="close-modal">&times;</span>
          <h2>Tu Carrito</h2>
          ${this.items.length === 0 ? '<p>El carrito está vacío</p>' : `
            <div class="cart-items">
              ${this.items.map(item => `
                <div class="cart-item">
                  <span>${item.name} (x${item.quantity})</span>
                  <span>$${(item.price * item.quantity).toFixed(2)}</span>
                  <button class="remove-item" data-id="${item.id}">eliminar</button>
                </div>
              `).join('')}
            </div>
            <div class="cart-total">
              <strong>Total: $${total.toFixed(2)}</strong>
            </div>
            <button class="btn btn-primary checkout-btn">Finalizar Compra</button>
          `}
        </div>
      `;
    },

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast animate-fade';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};
