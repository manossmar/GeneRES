const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all customers
router.get('/', async (req, res) => {
    try {
        const [customers] = await db.execute(
            'SELECT * FROM customers ORDER BY id DESC'
        );
        res.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ message: 'Error fetching customers' });
    }
});

// Create new customer
router.post('/', async (req, res) => {
    try {
        const { name, position, office, age, start_date, salary } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        const [result] = await db.execute(
            'INSERT INTO customers (name, position, office, age, start_date, salary) VALUES (?, ?, ?, ?, ?, ?)',
            [name, position || null, office || null, age || null, start_date || null, salary || null]
        );

        const [newCustomer] = await db.execute(
            'SELECT * FROM customers WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json(newCustomer[0]);
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ message: 'Error creating customer' });
    }
});

// Update customer
router.put('/:id', async (req, res) => {
    try {
        const customerId = req.params.id;
        const { name, position, office, age, start_date, salary } = req.body;

        // Verify customer exists
        const [existing] = await db.execute(
            'SELECT * FROM customers WHERE id = ?',
            [customerId]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        await db.execute(
            'UPDATE customers SET name = ?, position = ?, office = ?, age = ?, start_date = ?, salary = ? WHERE id = ?',
            [name, position || null, office || null, age || null, start_date || null, salary || null, customerId]
        );

        const [updatedCustomer] = await db.execute(
            'SELECT * FROM customers WHERE id = ?',
            [customerId]
        );

        res.json(updatedCustomer[0]);
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ message: 'Error updating customer' });
    }
});

// Delete customer
router.delete('/:id', async (req, res) => {
    try {
        const customerId = req.params.id;

        // Verify customer exists
        const [existing] = await db.execute(
            'SELECT * FROM customers WHERE id = ?',
            [customerId]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        await db.execute(
            'DELETE FROM customers WHERE id = ?',
            [customerId]
        );

        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({ message: 'Error deleting customer' });
    }
});

module.exports = router;
