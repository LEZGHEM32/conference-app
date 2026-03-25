const express = require('express');
const { getDb } = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/conferences/my - organizer's own conferences (MUST be before /:id)
router.get('/my', authenticateToken, requireRole('organizer'), (req, res) => {
  try {
    const db = getDb();
    const conferences = db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM registrations r WHERE r.conference_id = c.id) as registration_count
      FROM conferences c
      WHERE c.organizer_id = ?
      ORDER BY c.created_at DESC
    `).all(req.user.userId);
    res.json(conferences);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/conferences - list all conferences
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const conferences = db.prepare(`
      SELECT c.*, u.name as organizer_name,
        (SELECT COUNT(*) FROM registrations r WHERE r.conference_id = c.id) as registration_count
      FROM conferences c
      JOIN users u ON c.organizer_id = u.id
      ORDER BY c.date ASC
    `).all();
    res.json(conferences);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/conferences/:id - get single conference
router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const conference = db.prepare(`
      SELECT c.*, u.name as organizer_name,
        (SELECT COUNT(*) FROM registrations r WHERE r.conference_id = c.id) as registration_count
      FROM conferences c
      JOIN users u ON c.organizer_id = u.id
      WHERE c.id = ?
    `).get(req.params.id);

    if (!conference) {
      return res.status(404).json({ error: 'Conference not found' });
    }

    res.json(conference);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/conferences - create conference (organizer only)
router.post('/', authenticateToken, requireRole('organizer'), (req, res) => {
  const { title, description, date, location, capacity } = req.body;

  if (!title || !date || !location || !capacity) {
    return res.status(400).json({ error: 'Title, date, location, and capacity are required' });
  }

  try {
    const db = getDb();
    const stmt = db.prepare(
      'INSERT INTO conferences (title, description, date, location, capacity, organizer_id) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(title, description, date, location, capacity, req.user.userId);
    
    const conference = db.prepare('SELECT * FROM conferences WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(conference);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/conferences/:id - update conference (organizer only, own conference)
router.put('/:id', authenticateToken, requireRole('organizer'), (req, res) => {
  const { title, description, date, location, capacity } = req.body;

  try {
    const db = getDb();
    const conference = db.prepare('SELECT * FROM conferences WHERE id = ?').get(req.params.id);

    if (!conference) {
      return res.status(404).json({ error: 'Conference not found' });
    }

    if (conference.organizer_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to edit this conference' });
    }

    db.prepare(
      'UPDATE conferences SET title = ?, description = ?, date = ?, location = ?, capacity = ? WHERE id = ?'
    ).run(
      title || conference.title,
      description !== undefined ? description : conference.description,
      date || conference.date,
      location || conference.location,
      capacity || conference.capacity,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM conferences WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/conferences/:id - delete conference (organizer only, own conference)
router.delete('/:id', authenticateToken, requireRole('organizer'), (req, res) => {
  try {
    const db = getDb();
    const conference = db.prepare('SELECT * FROM conferences WHERE id = ?').get(req.params.id);

    if (!conference) {
      return res.status(404).json({ error: 'Conference not found' });
    }

    if (conference.organizer_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this conference' });
    }

    db.prepare('DELETE FROM registrations WHERE conference_id = ?').run(req.params.id);
    db.prepare('DELETE FROM conferences WHERE id = ?').run(req.params.id);
    
    res.json({ message: 'Conference deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
