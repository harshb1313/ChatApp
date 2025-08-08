require('dotenv').config()
const mongoose = require('mongoose')

let db;

const connectDatabase = async () => {
    try {
        const uri = process.env.MONGODB_URI
        if (!uri) {
            throw new Error('MONGODB_URI not found in environment variables') // Fixed: throw error instead of just logging
        }
        await mongoose.connect(uri)
        console.log('✅ Database connected successfully') // Fixed: added quotes around string
    } catch (error) {
        console.log('❌ Database connection error:', error)
        process.exit(1)
    }
} 



module.exports = { connectDatabase }