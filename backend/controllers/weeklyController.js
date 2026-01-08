const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.saveWeeklyPlan = async (req, res) => {
    try {
        const { startDate, days } = req.body;
        const plan = await prisma.weeklyPlan.create({
            data: {
                startDate: new Date(startDate),
                ...days // אובייקט שמכיל את ימי השבוע וה-IDs של האאוטפיטים
            }
        });
        res.status(201).json(plan);
    } catch (error) {
        res.status(500).json({ error: "Failed to save plan" });
    }
};

exports.getWeeklyPlan = async (req, res) => {
    try {
        const { date } = req.query;
        const plan = await prisma.weeklyPlan.findFirst({
            where: { startDate: new Date(date) }
        });
        res.json(plan || {});
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch plan" });
    }
};