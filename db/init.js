const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/patterns.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS patterns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    intent TEXT NOT NULL,
    problem TEXT,
    solution TEXT,
    implementation TEXT,
    uses TEXT,
    tradeoffs TEXT,
    author TEXT,
    code_snippet TEXT,
    code_language TEXT DEFAULT 'javascript',
    uml_image_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

db.close();
console.log('Database initialized.');
