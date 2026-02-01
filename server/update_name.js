import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

(async () => {
    const db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    await db.run("UPDATE users SET name = 'Isabel' WHERE email = 'admin@issadilly.com'");
    console.log("Admin name updated to Isabel");
})();
