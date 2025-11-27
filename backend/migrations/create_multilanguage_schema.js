const mysql = require('mysql2/promise');
require('dotenv').config();

async function createMultiLanguageSchema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'myadmin'
  });

  try {
    console.log('Starting multi-language schema migration...');

    // 1. Create languages table
    console.log('Creating languages table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS languages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        code VARCHAR(10) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        nativeName VARCHAR(100),
        isActive BOOLEAN DEFAULT TRUE,
        isDefault BOOLEAN DEFAULT FALSE,
        direction ENUM('ltr', 'rtl') DEFAULT 'ltr',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert supported languages
    console.log('Inserting supported languages...');
    await connection.query(`
      INSERT IGNORE INTO languages (code, name, nativeName, isDefault) VALUES
      ('en', 'English', 'English', TRUE),
      ('fr', 'French', 'Français', FALSE),
      ('de', 'German', 'Deutsch', FALSE),
      ('ru', 'Russian', 'Русский', FALSE),
      ('it', 'Italian', 'Italiano', FALSE)
    `);

    // 2. Add columns to hotels table
    console.log('Adding columns to hotels table...');

    const columnsToAdd = [
      { name: 'typeDescription', type: 'VARCHAR(100)' },
      { name: 'locationDescription', type: 'VARCHAR(100)' },
      { name: 'officialRating', type: 'VARCHAR(50)' },
      { name: 'googleRating', type: 'VARCHAR(50)' },
      { name: 'zip', type: 'VARCHAR(20)' },
      { name: 'telephone', type: 'VARCHAR(50)' },
      { name: 'email', type: 'VARCHAR(255)' },
      { name: 'architectureStyle', type: 'VARCHAR(100)' },
      { name: 'yearOpened', type: 'VARCHAR(4)' },
      { name: 'yearRenovated', type: 'VARCHAR(4)' },
      { name: 'yearRoomRenovated', type: 'VARCHAR(4)' },
      { name: 'airportCode', type: 'VARCHAR(10)' },
      { name: 'url', type: 'VARCHAR(500)' },
      { name: 'numBuildings', type: 'INT' },
      { name: 'numRooms', type: 'INT' },
      { name: 'checkInTime', type: 'VARCHAR(10)' },
      { name: 'checkOutTime', type: 'VARCHAR(10)' },
      { name: 'searchTags', type: 'TEXT' },
      { name: 'facilities', type: 'TEXT' },
      { name: 'referencePoints', type: 'TEXT' },
      { name: 'nearbyPoints', type: 'TEXT' },
      { name: 'ratingCommercial', type: 'VARCHAR(50)' },
      { name: 'communicationDetails', type: 'TEXT' },
      { name: 'media', type: 'TEXT' }
    ];

    for (const col of columnsToAdd) {
      try {
        // Check if column exists
        const [rows] = await connection.query(
          `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
                     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'hotels' AND COLUMN_NAME = ?`,
          [process.env.DB_NAME || 'myadmin', col.name]
        );

        if (rows.length === 0) {
          await connection.query(`ALTER TABLE hotels ADD COLUMN ${col.name} ${col.type}`);
          console.log(`Added column: ${col.name}`);
        } else {
          console.log(`Column ${col.name} already exists.`);
        }
      } catch (error) {
        console.error(`Error adding column ${col.name}:`, error.message);
      }
    }

    // 3. Create hotel_translations table
    console.log('Creating hotel_translations table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS hotel_translations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        hotelId INT NOT NULL,
        languageCode VARCHAR(10) NOT NULL,
        description TEXT,
        detailedDescription TEXT,
        additionalInformation TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (hotelId) REFERENCES hotels(id) ON DELETE CASCADE,
        FOREIGN KEY (languageCode) REFERENCES languages(code) ON UPDATE CASCADE,
        UNIQUE KEY unique_hotel_language (hotelId, languageCode),
        INDEX idx_hotel_language (hotelId, languageCode)
      )
    `);

    // 4. Create rooms table
    console.log('Creating rooms table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INT PRIMARY KEY AUTO_INCREMENT,
        hotelId INT NOT NULL,
        view VARCHAR(100),
        bedType VARCHAR(100),
        quantity INT,
        location VARCHAR(100),
        size VARCHAR(50),
        smokingAllowed BOOLEAN DEFAULT FALSE,
        facilities TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hotelId) REFERENCES hotels(id) ON DELETE CASCADE,
        INDEX idx_hotel (hotelId)
      )
    `);

    // 5. Create room_translations table
    console.log('Creating room_translations table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS room_translations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        roomId INT NOT NULL,
        languageCode VARCHAR(10) NOT NULL,
        name VARCHAR(255),
        mainDescription TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (roomId) REFERENCES rooms(id) ON DELETE CASCADE,
        FOREIGN KEY (languageCode) REFERENCES languages(code) ON UPDATE CASCADE,
        UNIQUE KEY unique_room_language (roomId, languageCode),
        INDEX idx_room_language (roomId, languageCode)
      )
    `);

    console.log('✅ Multi-language schema created successfully!');

  } catch (error) {
    console.error('❌ Error creating schema:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run migration
createMultiLanguageSchema()
  .then(() => {
    console.log('\nMigration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nMigration failed:', error);
    process.exit(1);
  });
