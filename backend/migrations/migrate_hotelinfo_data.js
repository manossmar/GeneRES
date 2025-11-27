const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateHotelinfoData() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'myadmin'
    });

    try {
        console.log('Starting hotelinfo data migration...');

        // Get all hotels with hotelinfo
        const [hotels] = await connection.query(
            'SELECT id, name, hotelinfo FROM hotels WHERE hotelinfo IS NOT NULL AND hotelinfo != ""'
        );

        console.log(`Found ${hotels.length} hotels with hotelinfo data`);

        let successCount = 0;
        let errorCount = 0;

        for (const hotel of hotels) {
            try {
                let hotelInfo;
                try {
                    hotelInfo = JSON.parse(hotel.hotelinfo);
                } catch (parseError) {
                    console.error(`❌ Failed to parse hotelinfo for hotel ${hotel.id} (${hotel.name})`);
                    errorCount++;
                    continue;
                }

                // Update hotel with extracted non-translatable fields
                await connection.query(
                    `UPDATE hotels SET 
            typeDescription = ?,
            locationDescription = ?,
            officialRating = ?,
            googleRating = ?,
            zip = ?,
            telephone = ?,
            email = ?,
            architectureStyle = ?,
            yearOpened = ?,
            yearRenovated = ?,
            yearRoomRenovated = ?,
            airportCode = ?,
            url = ?,
            numBuildings = ?,
            numRooms = ?,
            checkInTime = ?,
            checkOutTime = ?,
            searchTags = ?,
            facilities = ?,
            referencePoints = ?,
            nearbyPoints = ?,
            ratingCommercial = ?
          WHERE id = ?`,
                    [
                        hotelInfo.typeDescription || null,
                        hotelInfo.locationDescription || null,
                        hotelInfo.officialRating || null,
                        hotelInfo.googleRating || null,
                        hotelInfo.zip || null,
                        hotelInfo.telephone || null,
                        hotelInfo.email || null,
                        hotelInfo.architectureStyle || null,
                        hotelInfo.yearOpened || null,
                        hotelInfo.yearRenovated || null,
                        hotelInfo.yearRoomRenovated || null,
                        hotelInfo.airportCode || null,
                        hotelInfo.url || null,
                        hotelInfo.numBuildings || null,
                        hotelInfo.numRooms || null,
                        hotelInfo.checkInTime || null,
                        hotelInfo.checkOutTime || null,
                        hotelInfo.searchTags || null,
                        hotelInfo.facilities || null,
                        hotelInfo.referencePoints || null,
                        hotelInfo.nearbyPoints || null,
                        hotelInfo.ratingCommercial || null,
                        hotel.id
                    ]
                );

                // Create English translation from existing description fields
                if (hotelInfo.description || hotelInfo.detailedDescription || hotelInfo.additionalInformation) {
                    await connection.query(
                        `INSERT INTO hotel_translations (hotelId, languageCode, description, detailedDescription, additionalInformation)
             VALUES (?, 'en', ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             description = VALUES(description),
             detailedDescription = VALUES(detailedDescription),
             additionalInformation = VALUES(additionalInformation)`,
                        [
                            hotel.id,
                            hotelInfo.description || null,
                            hotelInfo.detailedDescription || null,
                            hotelInfo.additionalInformation || null
                        ]
                    );
                }

                // Migrate rooms if they exist
                if (hotelInfo.rooms && Array.isArray(hotelInfo.rooms)) {
                    for (const room of hotelInfo.rooms) {
                        // Insert room
                        const [roomResult] = await connection.query(
                            `INSERT INTO rooms (hotelId, view, bedType, quantity, location, size, smokingAllowed, facilities)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                            [
                                hotel.id,
                                room.view || null,
                                room.bedType || null,
                                room.quantity || null,
                                room.location || null,
                                room.size || null,
                                room.smokingAllowed || false,
                                room.facilities || null
                            ]
                        );

                        const roomId = roomResult.insertId;

                        // Insert English translation for room
                        if (room.name || room.mainDescription) {
                            await connection.query(
                                `INSERT INTO room_translations (roomId, languageCode, name, mainDescription)
                 VALUES (?, 'en', ?, ?)`,
                                [
                                    roomId,
                                    room.name || null,
                                    room.mainDescription || null
                                ]
                            );
                        }
                    }
                }

                successCount++;
                console.log(`✅ Migrated hotel ${hotel.id} (${hotel.name})`);

            } catch (error) {
                console.error(`❌ Error migrating hotel ${hotel.id} (${hotel.name}):`, error.message);
                errorCount++;
            }
        }

        console.log('\n=== Migration Summary ===');
        console.log(`Total hotels processed: ${hotels.length}`);
        console.log(`✅ Successfully migrated: ${successCount}`);
        console.log(`❌ Failed: ${errorCount}`);

        if (successCount === hotels.length) {
            console.log('\n✅ All data migrated successfully!');
            console.log('\nNext steps:');
            console.log('1. Verify the migrated data in the database');
            console.log('2. Test the application with the new schema');
            console.log('3. Once verified, you can drop the hotelinfo column:');
            console.log('   ALTER TABLE hotels DROP COLUMN hotelinfo;');
        }

    } catch (error) {
        console.error('❌ Migration error:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

// Run migration
migrateHotelinfoData()
    .then(() => {
        console.log('\nData migration completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\nData migration failed:', error);
        process.exit(1);
    });
