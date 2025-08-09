const User = require('../models/user')

async function addUser() {
  const wa_id = '8866239183';
  const name = 'voxie';

  try {
    const userExist = await User.findOne({ wa_id });
    if (!userExist) {
      await User.create({ wa_id, name });
      
    } else {
      console.log(`User ${name} already exists.`);
    }
  } catch (error) {
    if (error.code === 11000) { // duplicate key
      // Ignore duplicate key error gracefully
      console.log(`User ${name} already exists (duplicate key).`);
    } else {
      console.error('Error adding user:', error);
    }
  }
}

// addUser()

module.exports = { addUser };


