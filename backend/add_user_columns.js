require('dotenv').config({ path: 'backend/.env' });
const db = require('./db');

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_NAME:', process.env.DB_NAME);

async function addUserColumns() {
  try {
    await db.execute(`
      ALTER TABLE users
      ADD COLUMN first_name VARCHAR(255) NOT NULL,
      ADD COLUMN last_name VARCHAR(255) NOT NULL;
    `);
    console.log('Columns first_name and last_name added to users table.');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Columns first_name and last_name already exist in users table.');
    } else {
      console.error('Error adding columns to users table:', error);
    }
  } finally {
    db.end();
  }
}

addUserColumns();
