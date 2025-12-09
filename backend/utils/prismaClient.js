const { PrismaClient } = require('@prisma/client');

// יצירת Client חדש. Prisma כבר יודעת לקרוא את DATABASE_URL מ-process.env
const prisma = new PrismaClient();

module.exports = prisma;