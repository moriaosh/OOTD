// Test script to check if a user exists and can login
// Run with: node scripts/testLogin.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function testLogin() {
    const testEmail = 'alina@gmail.com';
    const testPassword = '123456';

    try {
        console.log('🔍 Testing login for:', testEmail);
        
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email: testEmail },
            select: {
                id: true,
                email: true,
                password: true,
                firstName: true,
                lastName: true,
            }
        });

        if (!user) {
            console.log('❌ User not found in database');
            console.log('\n💡 The user needs to be created first.');
            console.log('   You can either:');
            console.log('   1. Register through the frontend');
            console.log('   2. Create the user manually in the database');
            return;
        }

        console.log('✅ User found:', user.email);
        console.log('   User ID:', user.id);
        console.log('   Name:', user.firstName, user.lastName);

        // Test password
        const isPasswordValid = await bcrypt.compare(testPassword, user.password);
        
        if (isPasswordValid) {
            console.log('✅ Password is correct!');
            console.log('\n🎉 Login should work!');
        } else {
            console.log('❌ Password is incorrect');
            console.log('\n💡 The password in the database does not match "123456"');
            console.log('   The user may have been created with a different password.');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testLogin();

