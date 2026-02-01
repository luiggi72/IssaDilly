import { initDB } from './db.js';

const INITIAL_PRODUCTS = [
    {
        name: 'Torta Velvet de Ensueño',
        price: 35.00,
        category: 'Tortas',
        image: '/images/red-velvet.png',
        description: 'Suave bizcocho aterciopelado con crema de queso y un toque de vainilla.'
    },
    {
        name: 'Macarons de Lavanda',
        price: 15.00,
        category: 'Postres',
        image: '/images/macarons.png',
        description: 'Delicados macarons infusionados con lavanda orgánica.'
    },
    {
        name: 'Cookies Triple Chocolate',
        price: 12.00,
        category: 'Galletas',
        image: '/images/red-velvet.png',
        description: 'Galletas melosas con trozos de chocolate negro, leche y blanco.'
    },
    {
        name: 'Eclair de Pistacho',
        price: 18.00,
        category: 'Postres',
        image: '/images/macarons.png',
        description: 'Pasta choux rellena de crema pastelera de pistacho siciliano.'
    }
];

async function seed() {
    const db = await initDB();

    // Check if products exist
    const existing = await db.get('SELECT count(*) as count FROM products');
    if (existing.count > 0) {
        console.log('Database already has products.');
        return;
    }

    console.log('Seeding products...');
    for (const p of INITIAL_PRODUCTS) {
        await db.run(
            'INSERT INTO products (name, price, category, description, image) VALUES (?, ?, ?, ?, ?)',
            [p.name, p.price, p.category, p.description, p.image]
        );
    }
    console.log('Done!');
}

seed();
