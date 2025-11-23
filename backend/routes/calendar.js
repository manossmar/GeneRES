const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all calendar events for authenticated user
router.get('/events', async (req, res) => {
    try {
        const userId = req.userData.userId;
        const [events] = await db.execute(
            'SELECT * FROM calendar_events WHERE user_id = ? ORDER BY start_date ASC',
            [userId]
        );
        res.json(events);
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        res.status(500).json({ message: 'Error fetching calendar events' });
    }
});

// Create new calendar event
router.post('/events', async (req, res) => {
    try {
        const userId = req.userData.userId;
        const { title, start_date, end_date, event_level, notes } = req.body;

        if (!title || !start_date) {
            return res.status(400).json({ message: 'Title and start date are required' });
        }

        const [result] = await db.execute(
            'INSERT INTO calendar_events (user_id, title, start_date, end_date, event_level, notes) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, title, start_date, end_date || null, event_level || 'Primary', notes || null]
        );

        const [newEvent] = await db.execute(
            'SELECT * FROM calendar_events WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json(newEvent[0]);
    } catch (error) {
        console.error('Error creating calendar event:', error);
        res.status(500).json({ message: 'Error creating calendar event' });
    }
});

// Update calendar event
router.put('/events/:id', async (req, res) => {
    try {
        const userId = req.userData.userId;
        const eventId = req.params.id;
        const { title, start_date, end_date, event_level, notes } = req.body;

        // Verify event belongs to user
        const [existing] = await db.execute(
            'SELECT * FROM calendar_events WHERE id = ? AND user_id = ?',
            [eventId, userId]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        await db.execute(
            'UPDATE calendar_events SET title = ?, start_date = ?, end_date = ?, event_level = ?, notes = ? WHERE id = ? AND user_id = ?',
            [title, start_date, end_date || null, event_level || 'Primary', notes || null, eventId, userId]
        );

        const [updatedEvent] = await db.execute(
            'SELECT * FROM calendar_events WHERE id = ?',
            [eventId]
        );

        res.json(updatedEvent[0]);
    } catch (error) {
        console.error('Error updating calendar event:', error);
        res.status(500).json({ message: 'Error updating calendar event' });
    }
});

// Delete calendar event
router.delete('/events/:id', async (req, res) => {
    try {
        const userId = req.userData.userId;
        const eventId = req.params.id;

        // Verify event belongs to user
        const [existing] = await db.execute(
            'SELECT * FROM calendar_events WHERE id = ? AND user_id = ?',
            [eventId, userId]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        await db.execute(
            'DELETE FROM calendar_events WHERE id = ? AND user_id = ?',
            [eventId, userId]
        );

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting calendar event:', error);
        res.status(500).json({ message: 'Error deleting calendar event' });
    }
});

module.exports = router;
