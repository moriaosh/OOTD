// ייבוא ספריית הצפנה והטוקן
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ייבוא ה-Prisma Client שיצרנו
const prisma = require('../utils/prismaClient'); 

// קבלת JWT_SECRET מקובץ .env
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10; // מספר סבבי הגיבוב עבור הסיסמה

// --- הרשמת משתמש חדש (Register) ---
const register = async (req, res) => {
    // השדות הנדרשים כרגע: email ו-password (אפשר להוסיף firstName, lastName)
    const { email, password } = req.body;

    // ודא שכל השדות קיימים
    if (!email || !password) {
        return res.status(400).json({ message: 'אנא ספק/י אימייל וסיסמה.' });
    }

    try {
        // 1. בדיקה האם המשתמש כבר קיים (Prisma: findUnique)
        const existingUser = await prisma.user.findUnique({
            where: { email: email },
        });

        if (existingUser) {
            return res.status(409).json({ message: 'משתמש עם אימייל זה כבר קיים.' });
        }

        // 2. גיבוב (Hashing) הסיסמה
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // 3. יצירת משתמש חדש בבסיס הנתונים (Prisma: create)
        const newUser = await prisma.user.create({
            data: {
                email: email,
                password: hashedPassword, // שמירת הסיסמה המגובבת
                // ניתן להוסיף כאן firstName ו-lastName
            },
            // לא מחזירים את שדה הסיסמה ל-Frontend מטעמי אבטחה
            select: {
                id: true,
                email: true,
            }
        });

        // 4. יצירת טוקן אימות (JWT)
        const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({ 
            message: 'הרשמה בוצעה בהצלחה!',
            token: token,
            user: { id: newUser.id, email: newUser.email }
        });

    } catch (error) {
        console.error('REGISTER ERROR:', error);
        res.status(500).json({ message: 'שגיאת שרת פנימית במהלך ההרשמה.' });
    }
};

// --- כניסת משתמש (Login) ---
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'אנא ספק/י אימייל וסיסמה.' });
    }

    try {
        // 1. מציאת המשתמש לפי אימייל (Prisma: findUnique)
        const user = await prisma.user.findUnique({
            where: { email: email },
        });

        if (!user) {
            // הודעה כללית למניעת ניחוש משתמשים
            return res.status(401).json({ message: 'אימייל או סיסמה שגויים.' });
        }

        // 2. השוואת הסיסמה המגובבת (bcrypt)
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'אימייל או סיסמה שגויים.' });
        }

        // 3. יצירת טוקן אימות (JWT)
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            message: 'כניסה בוצעה בהצלחה!',
            token: token,
            user: { id: user.id, email: user.email }
        });

    } catch (error) {
        console.error('LOGIN ERROR:', error);
        res.status(500).json({ message: 'שגיאת שרת פנימית במהלך הכניסה.' });
    }
};

module.exports = {
    register,
    login,
};