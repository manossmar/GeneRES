const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const crypto = require('crypto');
const router = express.Router();

// Sign Up
router.post('/signup', async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            'INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, firstName, lastName]
        );
        res.status(201).json({ message: 'User created successfully.', userId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email already exists.' });
        }
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Sign In
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    const ip_address = req.ip;
    const user_agent = req.headers['user-agent'];

    console.log('Sign-in request received:', req.body); // Log incoming request
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    let logId;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Log the sign-in attempt
        const [logResult] = await connection.execute(
            'INSERT INTO logs (email, ip_address, user_agent, status) VALUES (?, ?, ?, ?)',
            [email, ip_address, user_agent, 'attempted']
        );
        logId = logResult.insertId;

        const query = `
            SELECT 
                id, email, password, first_name, last_name, 
                CASE WHEN picture IS NOT NULL THEN CONCAT('/api/user/', id, '/photo') ELSE '' END as picture,
                bio, city_state, country, phone, postal_code, tax_id, last_signin
            FROM users 
            WHERE email = ?
        `;
        const [rows] = await connection.execute(query, [email]);
        const user = rows[0];
        console.log('User fetched from DB:', user); // Log user object

        if (!user) {
            await connection.execute('UPDATE logs SET status = ? WHERE id = ?', ['failure', logId]);
            await connection.commit();
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Password validation result:', isPasswordValid); // Log password validation result

        if (!isPasswordValid) {
            await connection.execute('UPDATE logs SET status = ?, user_id = ? WHERE id = ?', ['failure', user.id, logId]);
            await connection.commit();
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Update log to success and user's last sign-in time
        await connection.execute('UPDATE logs SET status = ?, user_id = ? WHERE id = ?', ['success', user.id, logId]);
        await connection.execute('UPDATE users SET last_signin = ? WHERE id = ?', [new Date(), user.id]);

        await connection.commit();

        console.log('Password validation successful for email:', email);
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('JWT token generated for email:', email);
        const { password: hashedPassword, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
    } catch (error) {
        await connection.rollback();
        console.error('Signin error:', error);
        if (logId) {
            await db.execute('UPDATE logs SET status = ? WHERE id = ?', ['error', logId]);
        }
        res.status(500).json({ message: 'Internal server error.' });
    } finally {
        connection.release();
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpires = Date.now() + 3600000; // 1 hour
        await db.execute('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?', [resetToken, resetTokenExpires, user.id]);

        // Here you would send an email with the resetToken
        // For now, we'll just return it in the response for testing
        res.json({ message: 'Password reset token generated.', resetToken });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > ?', [token, Date.now()]);
        const user = rows[0];
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.execute('UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [hashedPassword, user.id]);
        res.json({ message: 'Password has been reset.' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;
