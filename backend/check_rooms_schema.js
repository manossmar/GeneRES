require('dotenv').config();
const db = require('./db');

async function checkRoomsSchema() {
    try {
        console.log('Checking rooms table schema...');
        const [rows] = await db.query('SHOW COLUMNS FROM rooms');
        console.log('Columns in rooms table:');
        rows.forEach(row => {
            console.log(`- ${row.Field} (${row.Type})`);
        });
        process.exit(0);
    } catch (error) {
        console.error('Error fetching schema:', error);
        process.exit(1);
    }
}

checkRoomsSchema();
