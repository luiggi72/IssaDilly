const API_URL = 'http://localhost:3001/api';
const token = localStorage.getItem('issadilly_token');

// Tab Switching
window.switchTab = (tabName) => {
    // Hide all
    document.getElementById('tab-products').style.display = 'none';
    document.getElementById('tab-users').style.display = 'none';
    document.getElementById('tab-admins').style.display = 'none';

    // Show target
    document.getElementById(`tab-${tabName}`).style.display = 'block';

    // Update Title
    const titles = {
        'products': 'Gestión de Productos',
        'users': 'Gestión de Clientes',
        'admins': 'Gestión de Administradores'
    };
    document.getElementById('page-title').textContent = titles[tabName];

    // Load data
    if (tabName === 'users' || tabName === 'admins') loadUsers();
    if (tabName === 'products') loadProducts();
};

// ... existing setup ...

async function loadUsers() {
    try {
        const res = await fetch(`${API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const allUsers = await res.json();

        // Filter groups
        const regularUsers = allUsers.filter(u => u.role !== 'admin');
        const adminUsers = allUsers.filter(u => u.role === 'admin');

        // Render functions

        document.getElementById('users-list').innerHTML = regularUsers.map(u => `
            <tr>
                <td><strong>${u.name || ''} ${u.lastname || ''}</strong></td>
                <td>${u.email}</td>
                <td><span style="padding: 5px 10px; background: #eee; border-radius: 20px; font-size: 0.85rem;">Cliente</span></td>
                <td>${u.phone_mobile || '-'}</td>
                <td>
                    <button class="btn-delete" onclick="deleteUser(${u.id})">Eliminar</button>
                </td>
            </tr>
        `).join('');

        document.getElementById('admins-list').innerHTML = adminUsers.map(u => `
            <tr>
                <td><strong>${u.name || ''} ${u.lastname || ''}</strong></td>
                <td>${u.email}</td>
                <td>
                    <select onchange="updateUserRole(${u.id}, this.value)" style="padding: 5px; border-radius: 5px; border: 1px solid #ddd; background: #ffeaa7;">
                        <option value="user">Usuario</option>
                        <option value="admin" selected>Administrador</option>
                    </select>
                </td>
                <td>${u.phone_mobile || '-'}</td>
                <td><small>Protegido</small></td>
            </tr>
        `).join('');

    } catch (err) {
        console.error("Error loading users", err);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // 1. Set Greeting
    try {
        const user = JSON.parse(localStorage.getItem('issadilly_user'));
        if (user && user.name) {
            const display = document.getElementById('admin-name-display');
            if (display) display.textContent = user.name.split(' ')[0];
        }
    } catch (e) {
        console.warn('Error setting greeting', e);
    }

    loadProducts();

    // 2. Product Form Submit
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fileInput = document.getElementById('p-image');
            const file = fileInput.files[0];
            const reader = new FileReader();

            reader.onloadend = async () => {
                const product = {
                    name: document.getElementById('p-name').value,
                    price: parseFloat(document.getElementById('p-price').value),
                    category: document.getElementById('p-category').value,
                    description: document.getElementById('p-desc').value,
                    image: reader.result
                };

                await fetch(`${API_URL}/products`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(product)
                });

                alert('Producto agregado');
                e.target.reset();
                loadProducts();
            };

            if (file) reader.readAsDataURL(file);
        });
    }

    // 3. Create User Handler
    const handleCreateUser = async (e, role, formId) => {
        e.preventDefault();
        const prefix = role === 'user' ? 'nu' : 'na';

        const userData = {
            name: document.getElementById(`${prefix}-name`).value,
            lastname: document.getElementById(`${prefix}-lastname`).value,
            email: document.getElementById(`${prefix}-email`).value,
            password: document.getElementById(`${prefix}-password`).value,
            role: role
        };

        try {
            const res = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            alert(`${role === 'admin' ? 'Administrador' : 'Cliente'} creado con éxito`);
            document.getElementById(formId).reset();
            loadUsers();
        } catch (err) {
            alert(err.message);
        }
    };


    const adminForm = document.getElementById('new-admin-form');
    if (adminForm) adminForm.addEventListener('submit', (e) => handleCreateUser(e, 'admin', 'new-admin-form'));

    // Logout
    window.adminLogout = () => {
        localStorage.removeItem('issadilly_token');
        localStorage.removeItem('issadilly_user');
        window.location.href = 'login.html';
    };
});

async function loadProducts() {
    const res = await fetch(`${API_URL}/products`);
    const products = await res.json();

    const tbody = document.getElementById('products-list');
    tbody.innerHTML = products.map(p => `
        <tr>
            <td><img src="${p.image}" class="product-thumb"></td>
            <td>${p.name}</td>
            <td>$${p.price.toFixed(2)}</td>
            <td>${p.category}</td>
            <td>
                <button class="btn-delete" onclick="deleteProduct(${p.id})">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

window.deleteProduct = async (id) => {
    if (!confirm('¿Seguro de eliminar este producto?')) return;

    await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    loadProducts();
};


window.updateUserRole = async (id, newRole) => {
    try {
        const res = await fetch(`${API_URL}/users/${id}/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ role: newRole })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error);
        }

        alert('Rol actualizado correctamente');
        loadUsers(); // Refresh to update visuals if needed
    } catch (err) {
        alert(err.message);
        loadUsers(); // Revert
    }
};

window.deleteUser = async (id) => {
    if (!confirm('¿Seguro de eliminar este usuario?')) return;

    await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    loadUsers();
};
