require('dotenv').config();
const db = require('./db');
const fs = require('fs');

async function checkSchema() {
    try {
        const [rows] = await db.query('SHOW COLUMNS FROM hotels');
        fs.writeFileSync('hotels_schema.json', JSON.stringify(rows, null, 2));
        console.log('Schema written to hotels_schema.json');
        process.exit(0);
    } catch (error) {
        console.error('Error fetching schema:', error);
        process.exit(1);
    }
}

checkSchema();
