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

    // Create calendar_events table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE,
        event_level ENUM('Danger', 'Success', 'Primary', 'Warning') DEFAULT 'Primary',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('Table calendar_events created or already exists.');

    // Create customers table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        position VARCHAR(255),
        office VARCHAR(255),
        age INT,
        start_date VARCHAR(50),
        salary VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    console.log('Table customers created or already exists.');

    // Create providers table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS providers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(255),
        status VARCHAR(50),
        description TEXT,
        notes TEXT,
        creation_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    console.log('Table providers created or already exists.');

    // Check if customers table is empty and insert mock data
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM customers');
    if (rows[0].count === 0) {
      console.log('Inserting 300 mock customer records...');

      const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Mary', 'William', 'Patricia', 'Richard', 'Jennifer', 'Thomas', 'Linda', 'Charles', 'Barbara', 'Daniel', 'Elizabeth'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
      const positions = ['Software Engineer', 'Senior Developer', 'Project Manager', 'Product Manager', 'UI/UX Designer', 'Data Analyst', 'DevOps Engineer', 'QA Engineer', 'Business Analyst', 'Marketing Manager', 'Sales Executive', 'HR Manager', 'Accountant', 'System Administrator', 'Technical Lead'];
      const offices = ['New York', 'London', 'Tokyo', 'San Francisco', 'Singapore', 'Sydney', 'Toronto', 'Berlin', 'Paris', 'Dubai', 'Mumbai', 'Shanghai', 'Los Angeles', 'Chicago', 'Boston'];

      const customers = [];
      for (let i = 0; i < 300; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const name = `${firstName} ${lastName}`;
        const position = positions[Math.floor(Math.random() * positions.length)];
        const office = offices[Math.floor(Math.random() * offices.length)];
        const age = Math.floor(Math.random() * (65 - 22 + 1)) + 22;

        // Random date between 2010 and 2024
        const year = Math.floor(Math.random() * (2024 - 2010 + 1)) + 2010;
        const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        const startDate = `${year}/${month}/${day}`;

        // Random salary between $30,000 and $200,000
        const salary = `$${(Math.floor(Math.random() * (200 - 30 + 1)) + 30) * 1000}`;

        customers.push([name, position, office, age, startDate, salary]);
      }

      // Insert in batches of 50 for better performance
      for (let i = 0; i < customers.length; i += 50) {
        const batch = customers.slice(i, i + 50);
        const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
        const values = batch.flat();

        await db.execute(
          `INSERT INTO customers (name, position, office, age, start_date, salary) VALUES ${placeholders}`,
          values
        );
      }

      console.log('Successfully inserted 300 mock customer records.');
    } else {
      console.log(`Customers table already contains ${rows[0].count} records. Skipping mock data insertion.`);
    }

  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

module.exports = setupDatabase;
