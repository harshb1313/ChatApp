require('dotenv').config()
const express = require('express')
const {processPayloads} = require('./services/payloadProcessor')
const {connectDatabase} = require('./config/database') // Fixed typo
const {router} = require('./routes/getMessages')

const app = express()
const PORT = process.env.PORT || 3000; // Use consistent variable name

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(router)

app.get('/', (req, res) => {
    res.json({ message: 'ChatApp Backend is running!' });
});

connectDatabase()
    .then(() => {
        console.log('✅ Database connected successfully');
        
        // Process existing payloads on startup (optional)
        processPayloads();
        
        // Start the server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.log('❌ Failed to start application:', error);
        process.exit(1);
    });


// app.listen(PORT,()=>(console.log(PORT,'active')))

