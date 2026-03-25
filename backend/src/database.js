const Database = require('better-sqlite3');
const path = require('path');

let db;

function initializeDatabase() {
  db = new Database(path.join(__dirname, '../../conference.db'));
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('organizer', 'participant')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS conferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      location TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      organizer_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organizer_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conference_id INTEGER NOT NULL,
      participant_id INTEGER NOT NULL,
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed')),
      UNIQUE(conference_id, participant_id),
      FOREIGN KEY (conference_id) REFERENCES conferences(id),
      FOREIGN KEY (participant_id) REFERENCES users(id)
    );
  `);

  return db;
}

function getDb() {
  return db;
}

module.exports = { initializeDatabase, getDb };
