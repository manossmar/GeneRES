const db = require('./db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('Running notifications table migration...');

        const sql = fs.readFileSync(
            path.join(__dirname, 'migrations', 'create_notifications_table.sql'),
            'utf8'
        );

        await db.query(sql);
        console.log('✓ Notifications table created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error running migration:', error);
        process.exit(1);
    }
}

runMigration();
