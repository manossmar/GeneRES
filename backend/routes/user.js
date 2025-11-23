const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');

// Set up multer for memory storage (to save as BLOB)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// GET user data
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const query = `
      SELECT 
        id, 
        email,
        COALESCE(first_name, '') as first_name,
        COALESCE(last_name, '') as last_name,
        CASE WHEN picture IS NOT NULL THEN CONCAT('/api/user/', id, '/photo') ELSE '' END as picture,
        COALESCE(bio, '') as bio,
        COALESCE(city_state, '') as city_state,
        COALESCE(country, '') as country,
        COALESCE(phone, '') as phone,
        COALESCE(postal_code, '') as postal_code,
        COALESCE(tax_id, '') as tax_id
      FROM users 
      WHERE id = ?
    `;
    const [rows] = await db.query(query, [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log("Backend - Sending user data:", rows[0]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET user photo
router.get('/:userId/photo', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.query('SELECT picture FROM users WHERE id = ?', [userId]);
    if (rows.length === 0 || !rows[0].picture) {
      return res.status(404).send('Photo not found');
    }

    const imageBuffer = rows[0].picture;
    let contentType = 'image/jpeg'; // Default

    // Simple magic number check
    if (imageBuffer.length > 4) {
      if (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50 && imageBuffer[2] === 0x4E && imageBuffer[3] === 0x47) {
        contentType = 'image/png';
      } else if (imageBuffer[0] === 0x47 && imageBuffer[1] === 0x49 && imageBuffer[2] === 0x46) {
        contentType = 'image/gif';
      }
    }

    res.setHeader('Content-Type', contentType);
    res.send(imageBuffer);
  } catch (error) {
    console.error('Error fetching user photo:', error);
    res.status(500).send('Server error');
  }
});

// PUT (update) user data
router.put('/:userId', upload.single('picture'), async (req, res) => {
  const { userId } = req.params;
  const updates = req.body;
  const values = [];
  let setClauses = [];

  // Handle other fields
  const allowedFields = ['first_name', 'last_name', 'email', 'phone', 'bio', 'country', 'city_state', 'postal_code', 'tax_id'];

  allowedFields.forEach(field => {
    if (updates[field] !== undefined) {
      setClauses.push(`${field} = ?`);
      values.push(updates[field]);
    }
  });

  // Handle picture
  if (req.file) {
    setClauses.push('picture = ?');
    values.push(req.file.buffer);
  } else if (updates.deletePicture === 'true') {
    setClauses.push('picture = NULL');
  }

  if (setClauses.length === 0) {
    return res.status(400).json({ message: 'No update data provided' });
  }

  const query = `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`;
  values.push(userId);

  try {
    await db.query(query, values);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST (update) user data from edit-user form (Legacy/Alternative)
router.post('/update', async (req, res) => {
  const { id, first_name, last_name, email, phone, bio } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const query = `
      UPDATE users 
      SET first_name = ?, last_name = ?, email = ?, phone = ?, bio = ?
      WHERE id = ?
    `;
    await db.query(query, [first_name, last_name, email, phone, bio, id]);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
