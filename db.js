const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const logger = require('./logger');

const db = new sqlite3.Database(path.join(__dirname, 'tabeeb.db'), (err) => {
    if (err) {
        logger.error('Error connecting to SQLite database', err);
    } else {
        logger.info('Connected to SQLite database');
    }
});

// Initialize tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS symptom_checks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        symptoms TEXT,
        result TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS medication_reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT,
        medication TEXT,
        dosage TEXT,
        frequency TEXT,
        times TEXT,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS lab_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        file_path TEXT,
        extracted_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
});

module.exports = db;
