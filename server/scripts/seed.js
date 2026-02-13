const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/workflowDB');
        console.log('Connected to MongoDB for seeding...');

        // Clear existing users
        await User.deleteMany({});
        console.log('Cleared existing users.');

        const users = [
            {
                name: 'Emma Employee',
                email: 'employee@flowstream.com',
                password: 'password123',
                role: 'Employee'
            },
            {
                name: 'Marcus Manager',
                email: 'manager@flowstream.com',
                password: 'password123',
                role: 'Manager'
            },
            {
                name: 'Alice Admin',
                email: 'admin@flowstream.com',
                password: 'password123',
                role: 'Admin'
            }
        ];

        for (const u of users) {
            await User.create(u);
            console.log(`Created user: ${u.name} (${u.role})`);
        }

        console.log('Seeding completed successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();
