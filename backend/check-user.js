const db = require('./db');
const bcrypt = require('bcryptjs');

async function checkUser() {
    try {
        const email = process.argv[2];
        const password = process.argv[3];

        if (!email || !password) {
            console.log('Usage: node check-user.js <email> <password>');
            process.exit(1);
        }

        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            console.log(`❌ No user found with email: ${email}`);
            console.log('\nAll users in database:');
            const [allUsers] = await db.execute('SELECT id, email, first_name, last_name FROM users');
            console.table(allUsers);
        } else {
            const user = rows[0];
            console.log(`✅ User found: ${user.first_name} ${user.last_name}`);
            console.log(`Email: ${user.email}`);
            console.log(`Password hash in DB: ${user.password.substring(0, 20)}...`);

            const isValid = await bcrypt.compare(password, user.password);
            console.log(`\nPassword check: ${isValid ? '✅ VALID' : '❌ INVALID'}`);

            if (!isValid) {
                console.log('\nThe password you entered does not match the hash in the database.');
                console.log('This could mean:');
                console.log('1. The password is incorrect');
                console.log('2. The password in the database was not hashed properly');
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkUser();
