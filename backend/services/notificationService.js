const db = require('../db');

class NotificationService {
    /**
     * Create a notification
     * @param {number} userId - Recipient user ID
     * @param {number|null} senderId - Sender user ID (null for system notifications)
     * @param {object} data - Notification data
     * @returns {Promise<object>} Created notification
     */
    static async create(userId, senderId, { type, title, message, link, metadata }) {
        const query = `
      INSERT INTO notifications (user_id, sender_id, type, title, message, link, metadata) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

        const result = await db.query(query, [
            userId,
            senderId,
            type,
            title,
            message,
            link || null,
            JSON.stringify(metadata || {})
        ]);

        return {
            id: result.insertId,
            user_id: userId,
            sender_id: senderId,
            type,
            title,
            message,
            link,
            metadata,
            is_read: false,
            created_at: new Date()
        };
    }

    /**
     * Send notification from one user to another
     */
    static async sendToUser(senderId, recipientId, { type, title, message, link }) {
        return this.create(recipientId, senderId, { type, title, message, link });
    }

    /**
     * Broadcast notification to multiple users
     */
    static async broadcast(senderId, recipientIds, { type, title, message, link }) {
        const notifications = [];
        for (const recipientId of recipientIds) {
            const notification = await this.create(recipientId, senderId, { type, title, message, link });
            notifications.push(notification);
        }
        return notifications;
    }

    // Helper methods for common system notifications

    static async notifyBookingCreated(userId, bookingId, hotelName) {
        return this.create(userId, null, {
            type: 'success',
            title: 'Booking Confirmed',
            message: `Your booking at ${hotelName} has been confirmed.`,
            link: `/bookings/${bookingId}`,
            metadata: { booking_id: bookingId }
        });
    }

    static async notifyBookingCancelled(userId, bookingId, hotelName) {
        return this.create(userId, null, {
            type: 'warning',
            title: 'Booking Cancelled',
            message: `Your booking at ${hotelName} has been cancelled.`,
            link: `/bookings/${bookingId}`,
            metadata: { booking_id: bookingId }
        });
    }

    static async notifySystemAlert(userId, message) {
        return this.create(userId, null, {
            type: 'info',
            title: 'System Alert',
            message,
            link: null,
            metadata: {}
        });
    }

    static async notifyUserMention(userId, mentionedBy, context) {
        return this.create(userId, mentionedBy, {
            type: 'info',
            title: 'You were mentioned',
            message: context,
            link: null,
            metadata: { mentioned_by: mentionedBy }
        });
    }
}

module.exports = NotificationService;
