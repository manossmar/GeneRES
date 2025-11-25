const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth');
const NotificationService = require('../services/notificationService');

// Get user's notifications
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { limit = 50, offset = 0, unread_only = 'false', type } = req.query;
        const userId = req.userData.userId;

        let query = `
      SELECT n.*, 
             u.first_name as sender_first_name, 
             u.last_name as sender_last_name
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.id
      WHERE n.user_id = ?
    `;
        const params = [userId];

        if (unread_only === 'true') {
            query += ' AND n.is_read = FALSE';
        }

        if (type) {
            query += ' AND n.type = ?';
            params.push(type);
        }

        query += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const notifications = await db.query(query, params);

        // Parse metadata JSON
        notifications.forEach(n => {
            if (n.metadata) {
                try {
                    n.metadata = JSON.parse(n.metadata);
                } catch (e) {
                    n.metadata = {};
                }
            }
        });

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Get unread count
router.get('/unread-count', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
            [req.userData.userId]
        );
        res.json({ count: result[0].count });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ error: 'Failed to fetch unread count' });
    }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
    try {
        await db.query(
            'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ? AND user_id = ?',
            [req.params.id, req.userData.userId]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

// Mark all notifications as read
router.put('/mark-all-read', authenticateToken, async (req, res) => {
    try {
        await db.query(
            'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE',
            [req.userData.userId]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({ error: 'Failed to mark all as read' });
    }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await db.query(
            'DELETE FROM notifications WHERE id = ? AND user_id = ?',
            [req.params.id, req.userData.userId]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});

// Bulk delete notifications
router.delete('/bulk-delete', authenticateToken, async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Invalid notification IDs' });
        }

        const placeholders = ids.map(() => '?').join(',');
        await db.query(
            `DELETE FROM notifications WHERE id IN (${placeholders}) AND user_id = ?`,
            [...ids, req.userData.userId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error bulk deleting notifications:', error);
        res.status(500).json({ error: 'Failed to delete notifications' });
    }
});

// Send notification to another user
router.post('/send', authenticateToken, async (req, res) => {
    try {
        const { recipient_id, type, title, message, link } = req.body;
        const senderId = req.userData.userId;

        // Validate required fields
        if (!recipient_id || !type || !title || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Verify recipient exists
        const recipient = await db.query('SELECT id FROM users WHERE id = ?', [recipient_id]);
        if (recipient.length === 0) {
            return res.status(404).json({ error: 'Recipient not found' });
        }

        // Create notification
        const notification = await NotificationService.sendToUser(senderId, recipient_id, {
            type,
            title,
            message,
            link
        });

        res.json(notification);
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
});

// Broadcast notification to multiple users (admin only)
router.post('/broadcast', authenticateToken, async (req, res) => {
    try {
        // TODO: Add admin role check when role field is added to users table
        // if (req.userData.role !== 'admin') {
        //     return res.status(403).json({ error: 'Unauthorized' });
        // }

        const { recipient_ids, type, title, message, link } = req.body;
        const senderId = req.userData.userId;

        // Validate required fields
        if (!recipient_ids || !Array.isArray(recipient_ids) || !type || !title || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Broadcast notification
        const notifications = await NotificationService.broadcast(senderId, recipient_ids, {
            type,
            title,
            message,
            link
        });

        res.json({ success: true, count: notifications.length });
    } catch (error) {
        console.error('Error broadcasting notification:', error);
        res.status(500).json({ error: 'Failed to broadcast notification' });
    }
});

module.exports = router;
