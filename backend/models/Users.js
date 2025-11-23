const db = require('../server').db; // או ייבוא של ה-connection

const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

db.query(createUsersTable, (err) => {
  if (err) throw err;
  console.log('טבלת users נוצרה/קיימת');
});

module.exports = db;