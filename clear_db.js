const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'arquilab.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error(err.message);
        return;
    }

    db.serialize(() => {
        db.run('DELETE FROM progress', (err) => {
            if (err) console.error("Error deleting progress:", err.message);
            else console.log("Progress table cleared.");
        });
        db.run('DELETE FROM users', (err) => {
            if (err) console.error("Error deleting users:", err.message);
            else console.log("Users table cleared.");
        });
    });

    db.close((err) => {
        if (err) console.error(err.message);
        console.log('Database connection closed.');
    });
});
