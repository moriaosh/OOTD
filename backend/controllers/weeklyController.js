const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.saveWeeklyPlan = async (req, res) => {
    try {
        const { startDate, days } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Check if plan already exists for this week and user
        const existingPlan = await prisma.weeklyPlan.findFirst({
            where: {
                userId: userId,
                startDate: new Date(startDate)
            }
        });

        let plan;
        if (existingPlan) {
            // Update existing plan
            plan = await prisma.weeklyPlan.update({
                where: { id: existingPlan.id },
                data: {
                    sunday: days.sunday || null,
                    monday: days.monday || null,
                    tuesday: days.tuesday || null,
                    wednesday: days.wednesday || null,
                    thursday: days.thursday || null,
                    friday: days.friday || null,
                    saturday: days.saturday || null
                }
            });
        } else {
            // Create new plan
            plan = await prisma.weeklyPlan.create({
                data: {
                    userId: userId,
                    startDate: new Date(startDate),
                    sunday: days.sunday || null,
                    monday: days.monday || null,
                    tuesday: days.tuesday || null,
                    wednesday: days.wednesday || null,
                    thursday: days.thursday || null,
                    friday: days.friday || null,
                    saturday: days.saturday || null
                }
            });
        }

        res.status(201).json(plan);
    } catch (error) {
        console.error('Save weekly plan error:', error);
        res.status(500).json({ error: "Failed to save plan" });
    }
};

exports.getWeeklyPlan = async (req, res) => {
    try {
        const { date } = req.query;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const plan = await prisma.weeklyPlan.findFirst({
            where: {
                userId: userId,
                startDate: new Date(date)
            }
        });

        res.json(plan || {});
    } catch (error) {
        console.error('Get weekly plan error:', error);
        res.status(500).json({ error: "Failed to fetch plan" });
    }
};