// Script to seed initial system tags
// Run with: node scripts/seedTags.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const systemTags = [
    'אהוב',
    'חדש',
    'למכירה',
    'צריך תיקון',
    'עונתי',
    'פורמלי',
    'קז\'ואל',
    'ספורט',
    'עבודה',
    'אירוע'
];

async function seedTags() {
    try {
        console.log('🌱 Starting to seed system tags...');

        for (const tagName of systemTags) {
            // Check if tag already exists
            const existing = await prisma.tag.findFirst({
                where: {
                    name: tagName,
                    userId: null
                }
            });

            if (!existing) {
                await prisma.tag.create({
                    data: {
                        name: tagName,
                        userId: null // System tag
                    }
                });
                console.log(`✅ Created tag: ${tagName}`);
            } else {
                console.log(`⏭️  Tag already exists: ${tagName}`);
            }
        }

        console.log('✨ Seeding completed!');
    } catch (error) {
        console.error('❌ Error seeding tags:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedTags();

