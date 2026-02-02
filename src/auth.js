const API_URL = 'http://localhost:3001/api';

export async function login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (response.ok) {
        localStorage.setItem('issadilly_token', data.token);
        localStorage.setItem('issadilly_user', JSON.stringify(data.user));
        window.location.href = data.user.role === 'admin' ? 'admin.html' : 'index.html';
    } else {
        throw new Error(data.error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin.html')) {
        checkAuth('admin');
    }
});

export async function checkAuth(requiredRole = null) {
    const token = localStorage.getItem('issadilly_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Unauthorized');

        const user = await response.json();
        if (requiredRole && user.role !== requiredRole) {
            window.location.href = 'index.html';
        }
    } catch (err) {
        localStorage.removeItem('issadilly_token');
        window.location.href = 'login.html';
    }
}

export function logout() {
    localStorage.removeItem('issadilly_token');
    localStorage.removeItem('issadilly_user');
    window.location.href = 'login.html';
}

window.adminLogout = logout;
