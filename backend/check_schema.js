require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkSchema() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await db.query('DESCRIBE hotels');
        console.log('Current columns in hotels table:');
        rows.forEach(row => console.log(row.Field));
    } catch (error) {
        console.error('Error describing table:', error);
    } finally {
        await db.end();
    }
}

checkSchema();
