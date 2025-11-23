require('dotenv').config({ path: 'backend/.env' });
const db = require('./db');

async function addPictureColumn() {
  try {
    await db.execute(`
      ALTER TABLE users
      ADD COLUMN picture VARCHAR(255) DEFAULT NULL;
    `);
    console.log('Column picture added to users table.');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Column picture already exists in users table.');
    } else {
      console.error('Error adding column to users table:', error);
    }
  } finally {
    db.end();
  }
}

addPictureColumn();
