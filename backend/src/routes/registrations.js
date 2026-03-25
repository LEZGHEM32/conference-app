const express = require('express');
const { getDb } = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/registrations/my - participant's registrations
router.get('/my', authenticateToken, requireRole('participant'), (req, res) => {
  try {
    const db = getDb();
    const registrations = db.prepare(`
      SELECT r.*, c.title, c.description, c.date, c.location, c.capacity,
        u.name as organizer_name
      FROM registrations r
      JOIN conferences c ON r.conference_id = c.id
      JOIN users u ON c.organizer_id = u.id
      WHERE r.participant_id = ?
      ORDER BY r.registered_at DESC
    `).all(req.user.userId);
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/registrations/conference/:conferenceId - all registrations for a conference (organizer only)
router.get('/conference/:conferenceId', authenticateToken, requireRole('organizer'), (req, res) => {
  try {
    const db = getDb();
    const conference = db.prepare('SELECT * FROM conferences WHERE id = ?').get(req.params.conferenceId);

    if (!conference) {
      return res.status(404).json({ error: 'Conference not found' });
    }

    if (conference.organizer_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const registrations = db.prepare(`
      SELECT r.*, u.name as participant_name, u.email as participant_email
      FROM registrations r
      JOIN users u ON r.participant_id = u.id
      WHERE r.conference_id = ?
      ORDER BY r.registered_at DESC
    `).all(req.params.conferenceId);

    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/registrations - register for a conference (participant only)
router.post('/', authenticateToken, requireRole('participant'), (req, res) => {
  const { conferenceId } = req.body;

  if (!conferenceId) {
    return res.status(400).json({ error: 'Conference ID is required' });
  }

  try {
    const db = getDb();
    const conference = db.prepare('SELECT * FROM conferences WHERE id = ?').get(conferenceId);

    if (!conference) {
      return res.status(404).json({ error: 'Conference not found' });
    }

    const registrationCount = db.prepare(
      'SELECT COUNT(*) as count FROM registrations WHERE conference_id = ?'
    ).get(conferenceId).count;

    if (registrationCount >= conference.capacity) {
      return res.status(400).json({ error: 'Conference is at full capacity' });
    }

    const stmt = db.prepare(
      'INSERT INTO registrations (conference_id, participant_id) VALUES (?, ?)'
    );
    const result = stmt.run(conferenceId, req.user.userId);

    const registration = db.prepare('SELECT * FROM registrations WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(registration);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Already registered for this conference' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/registrations/:conferenceId - cancel registration (participant only)
router.delete('/:conferenceId', authenticateToken, requireRole('participant'), (req, res) => {
  try {
    const db = getDb();
    const result = db.prepare(
      'DELETE FROM registrations WHERE conference_id = ? AND participant_id = ?'
    ).run(req.params.conferenceId, req.user.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json({ message: 'Registration cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/registrations/:id/status - update registration status (organizer only)
router.put('/:id/status', authenticateToken, requireRole('organizer'), (req, res) => {
  const { status } = req.body;

  if (!['pending', 'confirmed'].includes(status)) {
    return res.status(400).json({ error: 'Status must be pending or confirmed' });
  }

  try {
    const db = getDb();
    const registration = db.prepare(`
      SELECT r.*, c.organizer_id
      FROM registrations r
      JOIN conferences c ON r.conference_id = c.id
      WHERE r.id = ?
    `).get(req.params.id);

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (registration.organizer_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    db.prepare('UPDATE registrations SET status = ? WHERE id = ?').run(status, req.params.id);
    const updated = db.prepare('SELECT * FROM registrations WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
