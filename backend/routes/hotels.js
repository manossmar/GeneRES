const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET all hotels
router.get('/', auth, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM hotels ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching hotels:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET single hotel
router.get('/:id', auth, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM hotels WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Hotel not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching hotel:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST new hotel
router.post('/', auth, async (req, res) => {
    const fields = req.body;

    if (!fields.name) {
        return res.status(400).json({ message: 'Name is required' });
    }

    try {
        const columns = Object.keys(fields).filter(key => key !== 'id');
        const values = columns.map(col => fields[col]);
        const placeholders = columns.map(() => '?').join(', ');

        const query = `INSERT INTO hotels (${columns.join(', ')}) VALUES (${placeholders})`;
        const [result] = await db.query(query, values);

        const [newHotel] = await db.query('SELECT * FROM hotels WHERE id = ?', [result.insertId]);
        res.status(201).json(newHotel[0]);
    } catch (error) {
        console.error('Error creating hotel:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT update hotel
router.put('/:id', auth, async (req, res) => {
    const fields = req.body;
    const { id } = req.params;

    if (!fields.name) {
        return res.status(400).json({ message: 'Name is required' });
    }

    try {
        const columns = Object.keys(fields).filter(key => key !== 'id');
        const values = columns.map(col => fields[col]);
        const setClause = columns.map(col => `${col} = ?`).join(', ');

        const query = `UPDATE hotels SET ${setClause} WHERE id = ?`;
        const [result] = await db.query(query, [...values, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        const [updatedHotel] = await db.query('SELECT * FROM hotels WHERE id = ?', [id]);
        res.json(updatedHotel[0]);
    } catch (error) {
        console.error('Error updating hotel:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE hotel
router.delete('/:id', auth, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM hotels WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        res.json({ message: 'Hotel deleted successfully' });
    } catch (error) {
        console.error('Error deleting hotel:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
