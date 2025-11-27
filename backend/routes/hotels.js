const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Helper function to fetch hotel with translations
async function getHotelWithTranslations(hotelId) {
    // Fetch hotel
    const [hotels] = await db.query('SELECT * FROM hotels WHERE id = ?', [hotelId]);
    if (hotels.length === 0) {
        return null;
    }
    const hotel = hotels[0];

    // Fetch translations
    const [translations] = await db.query(
        'SELECT * FROM hotel_translations WHERE hotelId = ?',
        [hotelId]
    );

    // Fetch rooms
    console.log(`Fetching rooms for hotelId: ${hotelId}`);
    const [rooms] = await db.query('SELECT * FROM rooms WHERE hotelId = ?', [hotelId]);
    console.log(`Found ${rooms.length} rooms for hotelId ${hotelId}`);
    if (rooms.length > 0) {
        console.log('First room sample:', rooms[0]);
    }

    // Fetch room translations
    const roomIds = rooms.map(r => r.id);
    let roomTranslations = [];
    if (roomIds.length > 0) {
        [roomTranslations] = await db.query(
            'SELECT * FROM room_translations WHERE roomId IN (?)',
            [roomIds]
        );
    }

    // Format response
    const result = {
        ...hotel,
        communicationDetails: hotel.communicationDetails ? JSON.parse(hotel.communicationDetails) : [],
        media: hotel.media ? JSON.parse(hotel.media) : [],
        translations: translations.reduce((acc, t) => {
            acc[t.languageCode] = {
                description: t.description,
                detailedDescription: t.detailedDescription,
                additionalInformation: t.additionalInformation
            };
            return acc;
        }, {}),
        rooms: rooms.map(room => ({
            ...room,
            translations: roomTranslations
                .filter(rt => rt.roomId === room.id)
                .reduce((acc, rt) => {
                    acc[rt.languageCode] = {
                        name: rt.name,
                        mainDescription: rt.mainDescription
                    };
                    return acc;
                }, {})
        }))
    };

    return result;
}

// GET all hotels
router.get('/', auth, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM hotels ORDER BY id DESC');
        // Parse JSON fields for all hotels
        const hotels = rows.map(hotel => ({
            ...hotel,
            communicationDetails: hotel.communicationDetails ? JSON.parse(hotel.communicationDetails) : [],
            media: hotel.media ? JSON.parse(hotel.media) : []
        }));
        res.json(hotels);
    } catch (error) {
        console.error('Error fetching hotels:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET single hotel with translations
router.get('/:id', auth, async (req, res) => {
    try {
        const hotel = await getHotelWithTranslations(req.params.id);
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }
        res.json(hotel);
    } catch (error) {
        console.error('Error fetching hotel:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST new hotel with translations
router.post('/', auth, async (req, res) => {
    const { translations, rooms, ...hotelData } = req.body;

    if (!hotelData.name) {
        return res.status(400).json({ message: 'Name is required' });
    }

    // Stringify JSON fields
    if (hotelData.communicationDetails) {
        hotelData.communicationDetails = JSON.stringify(hotelData.communicationDetails);
    }
    if (hotelData.media) {
        hotelData.media = JSON.stringify(hotelData.media);
    }

    // Sanitize integer fields
    const intFields = ['numBuildings', 'numRooms', 'latitude', 'longitude'];
    intFields.forEach(field => {
        if (hotelData[field] === '') {
            hotelData[field] = null;
        }
    });

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // Insert hotel (exclude translations and rooms)
        const columns = Object.keys(hotelData).filter(key => key !== 'id');
        const values = columns.map(col => hotelData[col]);
        const placeholders = columns.map(() => '?').join(', ');

        const query = `INSERT INTO hotels (${columns.join(', ')}) VALUES (${placeholders})`;
        const [hotelResult] = await connection.query(query, values);
        const hotelId = hotelResult.insertId;

        // Insert translations
        if (translations) {
            for (const [langCode, trans] of Object.entries(translations)) {
                if (trans.description || trans.detailedDescription || trans.additionalInformation) {
                    await connection.query(
                        'INSERT INTO hotel_translations (hotelId, languageCode, description, detailedDescription, additionalInformation) VALUES (?, ?, ?, ?, ?)',
                        [hotelId, langCode, trans.description || null, trans.detailedDescription || null, trans.additionalInformation || null]
                    );
                }
            }
        }

        // Insert rooms and room translations
        if (rooms && Array.isArray(rooms)) {
            for (const room of rooms) {
                const { translations: roomTrans, ...roomData } = room;

                // Insert room
                const [roomResult] = await connection.query(
                    'INSERT INTO rooms (hotelId, view, bedType, quantity, location, size, smokingAllowed, facilities) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [hotelId, roomData.view || null, roomData.bedType || null, roomData.quantity || null, roomData.location || null, roomData.size || null, roomData.smokingAllowed || false, roomData.facilities || null]
                );
                const roomId = roomResult.insertId;

                // Insert room translations
                if (roomTrans) {
                    for (const [langCode, trans] of Object.entries(roomTrans)) {
                        if (trans.name || trans.mainDescription) {
                            await connection.query(
                                'INSERT INTO room_translations (roomId, languageCode, name, mainDescription) VALUES (?, ?, ?, ?)',
                                [roomId, langCode, trans.name || null, trans.mainDescription || null]
                            );
                        }
                    }
                }
            }
        }

        await connection.commit();

        // Fetch and return the complete hotel with translations
        const newHotel = await getHotelWithTranslations(hotelId);
        res.status(201).json(newHotel);
    } catch (error) {
        await connection.rollback();
        console.error('Error creating hotel:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    } finally {
        connection.release();
    }
});

// PUT update hotel
router.put('/:id', auth, async (req, res) => {
    const hotelId = req.params.id;
    const { translations, rooms, ...hotelData } = req.body;

    // Stringify JSON fields
    if (hotelData.communicationDetails) {
        hotelData.communicationDetails = JSON.stringify(hotelData.communicationDetails);
    }
    if (hotelData.media) {
        hotelData.media = JSON.stringify(hotelData.media);
    }

    // Sanitize integer fields
    const intFields = ['numBuildings', 'numRooms', 'latitude', 'longitude'];
    intFields.forEach(field => {
        if (hotelData[field] === '') {
            hotelData[field] = null;
        }
    });

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // Update hotel fields
        const columns = Object.keys(hotelData).filter(key => key !== 'id');
        if (columns.length > 0) {
            const setClause = columns.map(col => `${col} = ?`).join(', ');
            const values = [...columns.map(col => hotelData[col]), hotelId];
            await connection.query(`UPDATE hotels SET ${setClause} WHERE id = ?`, values);
        }

        // Update translations (upsert)
        if (translations) {
            for (const [langCode, trans] of Object.entries(translations)) {
                // Check if translation exists
                const [existing] = await connection.query(
                    'SELECT id FROM hotel_translations WHERE hotelId = ? AND languageCode = ?',
                    [hotelId, langCode]
                );

                if (existing.length > 0) {
                    await connection.query(
                        'UPDATE hotel_translations SET description = ?, detailedDescription = ?, additionalInformation = ? WHERE id = ?',
                        [trans.description || null, trans.detailedDescription || null, trans.additionalInformation || null, existing[0].id]
                    );
                } else if (trans.description || trans.detailedDescription || trans.additionalInformation) {
                    await connection.query(
                        'INSERT INTO hotel_translations (hotelId, languageCode, description, detailedDescription, additionalInformation) VALUES (?, ?, ?, ?, ?)',
                        [hotelId, langCode, trans.description || null, trans.detailedDescription || null, trans.additionalInformation || null]
                    );
                }
            }
        }

        // Update rooms - Strategy: Delete all existing rooms and recreate them (simplest for now)
        // In a production app, you might want to be smarter about this to preserve IDs if needed
        if (rooms && Array.isArray(rooms)) {
            // Delete existing rooms (cascade will delete room_translations)
            await connection.query('DELETE FROM rooms WHERE hotelId = ?', [hotelId]);

            // Re-insert rooms
            for (const room of rooms) {
                const { translations: roomTrans, ...roomData } = room;

                const [roomResult] = await connection.query(
                    'INSERT INTO rooms (hotelId, view, bedType, quantity, location, size, smokingAllowed, facilities) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [hotelId, roomData.view || null, roomData.bedType || null, roomData.quantity || null, roomData.location || null, roomData.size || null, roomData.smokingAllowed || false, roomData.facilities || null]
                );
                const roomId = roomResult.insertId;

                if (roomTrans) {
                    for (const [langCode, trans] of Object.entries(roomTrans)) {
                        if (trans.name || trans.mainDescription) {
                            await connection.query(
                                'INSERT INTO room_translations (roomId, languageCode, name, mainDescription) VALUES (?, ?, ?, ?)',
                                [roomId, langCode, trans.name || null, trans.mainDescription || null]
                            );
                        }
                    }
                }
            }
        }

        await connection.commit();

        const updatedHotel = await getHotelWithTranslations(hotelId);
        res.json(updatedHotel);
    } catch (error) {
        await connection.rollback();
        console.error('Error updating hotel:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    } finally {
        connection.release();
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
