const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const db = new sqlite3.Database('./db/patterns.db');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static('public'));

// File upload with type validation
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif', '.tiff', '.bmp'];

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) cb(null, true);
    else cb(new Error('Only image files are allowed: ' + allowedExtensions.join(', ')));
};

const upload = multer({ storage, fileFilter });

// --- CRUD Endpoints ---

// Get all patterns
app.get('/patterns', (req, res) => {
    db.all('SELECT * FROM patterns ORDER BY created_at DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get pattern by ID
app.get('/patterns/:id', (req, res) => {
    db.get('SELECT * FROM patterns WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

// Create new pattern
app.post('/patterns', upload.single('uml_image'), (req, res) => {
    const { name, type, intent, problem, solution, implementation, uses, tradeoffs, author, code_snippet, code_language } = req.body;
    const uml_image_filename = req.file ? req.file.filename : null;

    const sql = `INSERT INTO patterns
    (name, type, intent, problem, solution, implementation, uses, tradeoffs, author, code_snippet, code_language, uml_image_path)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [name, type, intent, problem, solution, implementation, uses, tradeoffs, author, code_snippet, code_language, uml_image_filename];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});

// Update pattern
app.put('/patterns/:id', upload.single('uml_image'), (req, res) => {
    const { name, type, intent, problem, solution, implementation, uses, tradeoffs, author, code_snippet, code_language } = req.body;
    const newUmlFilename = req.file ? req.file.filename : null;
    const patternId = req.params.id;

    db.get('SELECT * FROM patterns WHERE id = ?', [patternId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Pattern not found' });

        // Delete old UML file if new one uploaded
        if (newUmlFilename && row.uml_image_path) {
            const oldPath = path.join(__dirname, 'uploads', row.uml_image_path);
            fs.unlink(oldPath, err => {
                if (err) console.error('Error deleting old UML file:', err);
            });
        }

        const sql = `UPDATE patterns SET
      name=?, type=?, intent=?, problem=?, solution=?, implementation=?, uses=?, tradeoffs=?, author=?, code_snippet=?, code_language=?,
      updated_at=CURRENT_TIMESTAMP
      ${newUmlFilename ? ', uml_image_path=?' : ''} WHERE id=?`;

        const params = newUmlFilename
            ? [name, type, intent, problem, solution, implementation, uses, tradeoffs, author, code_snippet, code_language, newUmlFilename, patternId]
            : [name, type, intent, problem, solution, implementation, uses, tradeoffs, author, code_snippet, code_language, patternId];

        db.run(sql, params, function (err2) {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ updated: this.changes });
        });
    });
});

// Delete Pattern
app.delete('/patterns/:id', (req, res) => {
    const patternId = req.params.id;

    db.get('SELECT * FROM patterns WHERE id = ?', [patternId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Pattern not found' });

        if (row.uml_image_path) {
            const filePath = path.join(__dirname, 'uploads', row.uml_image_path);
            fs.unlink(filePath, (err) => {
                if (err) console.error('Error deleting UML file:', err);
            });
        }

        db.run('DELETE FROM patterns WHERE id = ?', [patternId], function (err2) {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ deleted: this.changes });
        });
    });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
