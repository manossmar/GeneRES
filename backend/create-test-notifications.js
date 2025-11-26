const db = require('./db');
const NotificationService = require('./services/notificationService');

async function createTestNotifications() {
    try {
        console.log('Creating test notifications...');

        // Get first user from database
        const [users] = await db.query('SELECT id, first_name, last_name FROM users LIMIT 2');

        if (users.length === 0) {
            console.log('No users found in database. Please create a user first.');
            process.exit(1);
        }

        const user1 = users[0];
        console.log(`Found user: ${user1.first_name} ${user1.last_name} (ID: ${user1.id})`);

        // Create a system notification
        await NotificationService.create(user1.id, null, {
            type: 'info',
            title: 'Welcome to the Notification System',
            message: 'This is a test notification from the system.',
            link: null,
            metadata: {}
        });
        console.log('✓ Created system notification');

        // Create a user-to-user notification if we have 2 users
        if (users.length >= 2) {
            const user2 = users[1];
            await NotificationService.sendToUser(user2.id, user1.id, {
                type: 'success',
                title: 'Test User Notification',
                message: `Hello from ${user2.first_name}!`,
                link: null
            });
            console.log('✓ Created user-to-user notification');
        }

        // Show all notifications
        const [notifications] = await db.query('SELECT * FROM notifications');
        console.log('\nAll notifications in database:');
        console.log(JSON.stringify(notifications, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createTestNotifications();
