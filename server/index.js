import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { initDB } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'issadilly_secret_key_2024';

app.use(cors());
app.use(express.json({ limit: '50mb' }));

let db;

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    next();
};

// Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
        res.status(201).json({ message: 'Usuario registrado con éxito' });
    } catch (e) {
        res.status(400).json({ error: 'El email ya existe o hay un error en los datos' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user }); // Return full user object
});

// Update Profile including new fields
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
    const {
        name, lastname, phone_mobile, phone_landline,
        phone, payment_method, // Legacy fields support
        street, exterior, interior, neighborhood, city, state, delegation, zip
    } = req.body;

    try {
        await db.run(
            `UPDATE users SET 
                name = ?, lastname = ?, phone_mobile = ?, phone_landline = ?,
                phone = ?, payment_method = ?, 
                street = ?, exterior = ?, interior = ?, neighborhood = ?, 
                city = ?, state = ?, delegation = ?, zip = ? 
            WHERE id = ?`,
            [
                name, lastname, phone_mobile, phone_landline,
                phone, payment_method,
                street, exterior, interior, neighborhood, city, state, delegation, zip,
                req.user.id
            ]
        );
        const updatedUser = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
        res.json({ message: 'Perfil actualizado', user: updatedUser });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error al actualizar perfil' });
    }
});

// Admin: Get All Users
app.get('/api/users', authenticateToken, adminOnly, async (req, res) => {
    try {
        const users = await db.all('SELECT id, name, lastname, email, role, phone_mobile, phone_landline FROM users');
        res.json(users);
    } catch (e) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// Admin: Update User Role
app.put('/api/users/:id/role', authenticateToken, adminOnly, async (req, res) => {
    const { role } = req.body;
    const { id } = req.params;

    // Prevent self-demotion
    if (parseInt(id) === req.user.id && role !== 'admin') {
        return res.status(400).json({ error: 'No puedes quitarte tu propio rol de administrador' });
    }

    try {
        await db.run('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        res.json({ message: 'Rol actualizado' });
    } catch (e) {
        res.status(500).json({ error: 'Error al actualizar rol' });
    }
});

// Admin: Create User
app.post('/api/users', authenticateToken, adminOnly, async (req, res) => {
    try {
        const { name, email, password, role, lastname, phone_mobile, phone_landline } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.run(
            'INSERT INTO users (name, lastname, email, password, role, phone_mobile, phone_landline) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, lastname, email, hashedPassword, role, phone_mobile, phone_landline]
        );
        res.status(201).json({ id: result.lastID, message: 'Usuario creado con éxito' });
    } catch (e) {
        res.status(400).json({ error: 'Error al crear usuario. Verifica que el email no exista.' });
    }
});

// Admin: Delete User
app.delete('/api/users/:id', authenticateToken, adminOnly, async (req, res) => {
    try {
        await db.run('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'Usuario eliminado' });
    } catch (e) {
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
});

app.get('/api/products', async (req, res) => {
    const products = await db.all('SELECT * FROM products');
    res.json(products);
});

app.post('/api/products', authenticateToken, adminOnly, async (req, res) => {
    try {
        const { name, price, category, description, image } = req.body;
        const result = await db.run(
            'INSERT INTO products (name, price, category, description, image) VALUES (?, ?, ?, ?, ?)',
            [name, price, category, description, image]
        );
        res.status(201).json({ id: result.lastID, message: 'Producto guardado' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/products/:id', authenticateToken, adminOnly, async (req, res) => {
    await db.run('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Producto eliminado' });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
    res.json(req.user);
});

// Start Server
initDB().then(database => {
    db = database;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
