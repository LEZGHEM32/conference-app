const express = require('express');
const db = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get my registered conferences (participants only)
router.get('/my/list', authenticate, requireRole('participant'), (req, res) => {
  const conferences = db.prepare(`
    SELECT c.*, u.name as organizer_name, r.registered_at
    FROM registrations r
    JOIN conferences c ON r.conference_id = c.id
    JOIN users u ON c.organizer_id = u.id
    WHERE r.participant_id = ?
    ORDER BY c.start_date ASC
  `).all(req.user.id);
  res.json(conferences);
});

// Check if participant is registered for a specific conference
router.get('/check/:conferenceId', authenticate, requireRole('participant'), (req, res) => {
  const reg = db.prepare('SELECT * FROM registrations WHERE conference_id = ? AND participant_id = ?')
    .get(req.params.conferenceId, req.user.id);
  res.json({ registered: !!reg });
});

// Register for a conference (participants only)
router.post('/:conferenceId', authenticate, requireRole('participant'), (req, res) => {
  const registerTx = db.transaction(() => {
    const conf = db.prepare('SELECT * FROM conferences WHERE id = ?').get(req.params.conferenceId);
    if (!conf) return { status: 404, body: { message: 'Conference not found' } };
    const count = db.prepare('SELECT COUNT(*) as c FROM registrations WHERE conference_id = ?').get(conf.id).c;
    if (count >= conf.max_participants) {
      return { status: 409, body: { message: 'Conference is full' } };
    }
    db.prepare('INSERT INTO registrations (conference_id, participant_id) VALUES (?, ?)').run(conf.id, req.user.id);
    return { status: 201, body: { message: 'Registered successfully' } };
  });
  try {
    const result = registerTx();
    return res.status(result.status).json(result.body);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ message: 'Already registered' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Unregister from a conference (participants only)
router.delete('/:conferenceId', authenticate, requireRole('participant'), (req, res) => {
  const result = db.prepare('DELETE FROM registrations WHERE conference_id = ? AND participant_id = ?')
    .run(req.params.conferenceId, req.user.id);
  if (result.changes === 0) return res.status(404).json({ message: 'Registration not found' });
  res.json({ message: 'Unregistered successfully' });
});

module.exports = router;
