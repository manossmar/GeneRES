const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET all providers
router.get('/', auth, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM providers ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching providers:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET single provider
router.get('/:id', auth, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM providers WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Provider not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching provider:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST new provider
router.post('/', auth, async (req, res) => {
    const { name, category, status, description, notes, creation_date } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }

    try {
        const query = `
      INSERT INTO providers (name, category, status, description, notes, creation_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
        const [result] = await db.query(query, [name, category, status, description, notes, creation_date]);

        const [newProvider] = await db.query('SELECT * FROM providers WHERE id = ?', [result.insertId]);
        res.status(201).json(newProvider[0]);
    } catch (error) {
        console.error('Error creating provider:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT update provider
router.put('/:id', auth, async (req, res) => {
    const { name, category, status, description, notes, creation_date } = req.body;
    const { id } = req.params;

    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }

    try {
        const query = `
      UPDATE providers 
      SET name = ?, category = ?, status = ?, description = ?, notes = ?, creation_date = ?
      WHERE id = ?
    `;
        const [result] = await db.query(query, [name, category, status, description, notes, creation_date, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        const [updatedProvider] = await db.query('SELECT * FROM providers WHERE id = ?', [id]);
        res.json(updatedProvider[0]);
    } catch (error) {
        console.error('Error updating provider:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE provider
router.delete('/:id', auth, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM providers WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        res.json({ message: 'Provider deleted successfully' });
    } catch (error) {
        console.error('Error deleting provider:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
