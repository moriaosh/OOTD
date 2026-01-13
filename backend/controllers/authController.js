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
    // השדות הנדרשים: email ו-password (firstName, lastName אופציונליים)
    const { email, password, firstName, lastName } = req.body;

    // ודא שכל השדות קיימים
    if (!email || !password) {
        if (password.length < 8) {
            return res.status(400).json({
            message: 'הסיסמה חייבת להכיל לפחות 8 תווים.'
            });
    }

    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
        return res.status(400).json({
         message: 'הסיסמה חייבת להכיל אותיות ומספרים.'
        });
    }

  // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
     return res.status(400).json({
      message: 'כתובת אימייל לא תקינה.'
     });
    }
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
                firstName: firstName || null,
                lastName: lastName || null,
            },
            // לא מחזירים את שדה הסיסמה ל-Frontend מטעמי אבטחה
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
            }
        });

        // 4. יצירת טוקן אימות (JWT)
        const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({ 
            message: 'הרשמה בוצעה בהצלחה!',
            token: token,
            user: { id: newUser.id, email: newUser.email, firstName: newUser.firstName, lastName: newUser.lastName }
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
            select: {
                id: true,
                email: true,
                password: true,
                firstName: true,
                lastName: true,
            }
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
            user: { 
                id: user.id, 
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });

    } catch (error) {
        console.error('LOGIN ERROR:', error);
        res.status(500).json({ message: 'שגיאת שרת פנימית במהלך הכניסה.' });
    }
};

// --- Get User Profile ---
const getProfile = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
                colorAnalyses: {
                    orderBy: { createdAt: 'desc' },
                    take: 1, // Get the most recent color analysis
                    select: {
                        season: true,
                        skinTone: true,
                        bestColors: true,
                        recommendations: true,
                        createdAt: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'משתמש לא נמצא' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'שגיאה בשליפת פרופיל' });
    }
};

// --- Update User Profile ---
const updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { firstName, lastName, profilePicture } = req.body;

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                profilePicture: profilePicture || undefined
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profilePicture: true
            }
        });

        res.status(200).json({
            message: 'הפרופיל עודכן בהצלחה!',
            user: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'שגיאה בעדכון פרופיל' });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile
};