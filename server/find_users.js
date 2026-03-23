const mongoose = require('mongoose');
const User = require('./models/User');

async function findUsers() {
    await mongoose.connect('mongodb://localhost:27017/workflowDB');
    const users = await User.find({}, 'name email role');
    console.log(JSON.stringify(users, null, 2));
    await mongoose.disconnect();
}

findUsers();
