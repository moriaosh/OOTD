const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

// הרשמה
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) return res.status(400).json({ msg: 'חסר אימייל או סיסמה' });

  // בדיקה אם המשתמש קיים
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) throw err;
    if (results.length > 0) return res.status(400).json({ msg: 'משתמש כבר קיים' });

    // הצפנת סיסמה
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // שמירה ב-DB
    db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', 
      [name || '', email, hashedPassword], (err, result) => {
        if (err) throw err;

        // יצירת טוקן
        const token = jwt.sign({ id: result.insertId }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: result.insertId, email, name: name || '' } });
      });
  });
};

// כניסה
const login = async (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) throw err;
    if (results.length === 0) return res.status(400).json({ msg: 'משתמש לא קיים' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'סיסמה שגויה' });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  });
};

module.exports = { register, login };