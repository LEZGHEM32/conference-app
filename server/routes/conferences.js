const express = require('express');
const db = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// List all conferences (public)
router.get('/', (req, res) => {
  const conferences = db.prepare(`
    SELECT c.*, u.name as organizer_name,
      (SELECT COUNT(*) FROM registrations r WHERE r.conference_id = c.id) as participant_count
    FROM conferences c
    JOIN users u ON c.organizer_id = u.id
    ORDER BY c.start_date ASC
  `).all();
  res.json(conferences);
});

// Get conferences for the logged-in organizer
router.get('/my/list', authenticate, requireRole('organizer'), (req, res) => {
  const conferences = db.prepare(`
    SELECT c.*,
      (SELECT COUNT(*) FROM registrations r WHERE r.conference_id = c.id) as participant_count
    FROM conferences c
    WHERE c.organizer_id = ?
    ORDER BY c.start_date ASC
  `).all(req.user.id);
  res.json(conferences);
});

// Get one conference (public)
router.get('/:id', (req, res) => {
  const conference = db.prepare(`
    SELECT c.*, u.name as organizer_name,
      (SELECT COUNT(*) FROM registrations r WHERE r.conference_id = c.id) as participant_count
    FROM conferences c
    JOIN users u ON c.organizer_id = u.id
    WHERE c.id = ?
  `).get(req.params.id);
  if (!conference) return res.status(404).json({ message: 'Conference not found' });
  res.json(conference);
});

// Create conference (organizers only)
router.post('/', authenticate, requireRole('organizer'), (req, res) => {
  const { title, description, location, start_date, end_date, max_participants } = req.body;
  if (!title || !start_date || !end_date) {
    return res.status(400).json({ message: 'Title, start_date, and end_date are required' });
  }
  if (start_date >= end_date) {
    return res.status(400).json({ message: 'start_date must be before end_date' });
  }
  const stmt = db.prepare('INSERT INTO conferences (title, description, location, start_date, end_date, max_participants, organizer_id) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const result = stmt.run(title, description || '', location || '', start_date, end_date, max_participants || 100, req.user.id);
  const created = db.prepare('SELECT * FROM conferences WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

// Update conference (organizer who owns it)
router.put('/:id', authenticate, requireRole('organizer'), (req, res) => {
  const conf = db.prepare('SELECT * FROM conferences WHERE id = ?').get(req.params.id);
  if (!conf) return res.status(404).json({ message: 'Conference not found' });
  if (conf.organizer_id !== req.user.id) return res.status(403).json({ message: 'Not your conference' });
  const { title, description, location, start_date, end_date, max_participants } = req.body;
  const newStart = start_date ?? conf.start_date;
  const newEnd = end_date ?? conf.end_date;
  if (newStart >= newEnd) {
    return res.status(400).json({ message: 'start_date must be before end_date' });
  }
  db.prepare('UPDATE conferences SET title=?, description=?, location=?, start_date=?, end_date=?, max_participants=? WHERE id=?')
    .run(title ?? conf.title, description ?? conf.description, location ?? conf.location,
         newStart, newEnd, max_participants ?? conf.max_participants, conf.id);
  const updated = db.prepare('SELECT * FROM conferences WHERE id = ?').get(conf.id);
  res.json(updated);
});

// Delete conference (organizer who owns it)
router.delete('/:id', authenticate, requireRole('organizer'), (req, res) => {
  const conf = db.prepare('SELECT * FROM conferences WHERE id = ?').get(req.params.id);
  if (!conf) return res.status(404).json({ message: 'Conference not found' });
  if (conf.organizer_id !== req.user.id) return res.status(403).json({ message: 'Not your conference' });
  db.prepare('DELETE FROM registrations WHERE conference_id = ?').run(conf.id);
  db.prepare('DELETE FROM conferences WHERE id = ?').run(conf.id);
  res.json({ message: 'Conference deleted' });
});

module.exports = router;
