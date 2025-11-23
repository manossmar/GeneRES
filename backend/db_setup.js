require('dotenv').config();
const db = require('./db');

async function setupDatabase() {
  try {
    // Create logs table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        email VARCHAR(255),
        ip_address VARCHAR(255),
        user_agent VARCHAR(255),
        status VARCHAR(50),
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    console.log('Table logs created or already exists.');

  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

module.exports = setupDatabase;
