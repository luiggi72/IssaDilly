import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';

export async function initDB() {
    const db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            role TEXT DEFAULT 'user',
            name TEXT,       -- Now used for First Name(s)
            lastname TEXT,   -- New
            phone_mobile TEXT, -- New
            phone_landline TEXT, -- New
            payment_method TEXT,
            street TEXT,
            exterior TEXT,
            interior TEXT,
            neighborhood TEXT,
            city TEXT,
            state TEXT,
            delegation TEXT,
            zip TEXT
        );

        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            price REAL,
            category TEXT,
            description TEXT,
            image TEXT
        );
    `);

    // Check if columns exist (for migration)
    const columnsToAdd = ['street', 'exterior', 'interior', 'neighborhood', 'city', 'state', 'delegation', 'zip', 'lastname', 'phone_mobile', 'phone_landline'];
    for (const col of columnsToAdd) {
        try {
            await db.exec(`ALTER TABLE users ADD COLUMN ${col} TEXT`);
        } catch (e) { }
    }

    // Create a default admin if not exists
    const admin = await db.get('SELECT * FROM users WHERE email = ?', ['admin@issadilly.com']);
    if (!admin) {
        const hashedPass = await bcrypt.hash('dulce2024', 10);
        await db.run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            ['Isabel', 'admin@issadilly.com', hashedPass, 'admin']);
    }

    return db;
}
