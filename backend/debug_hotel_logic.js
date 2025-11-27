require('dotenv').config();
const db = require('./db');

async function debugHotelLogic() {
    try {
        console.log('Starting debug logic...');

        // 3. Find a hotel that HAS rooms
        console.log('Searching for a hotel that has rooms...');
        const [hotelsWithRooms] = await db.query(`
            SELECT h.id, h.name, COUNT(r.id) as room_count 
            FROM hotels h 
            JOIN rooms r ON h.id = r.hotelId 
            GROUP BY h.id 
            LIMIT 5
        `);

        if (hotelsWithRooms.length > 0) {
            console.log('Found hotels with rooms:');
            hotelsWithRooms.forEach(h => {
                console.log(`- ID: ${h.id}, Name: ${h.name}, Rooms: ${h.room_count}`);
            });
        } else {
            console.log('No hotels found with linked rooms.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error in debug logic:', error);
        process.exit(1);
    }
}

debugHotelLogic();
