require('dotenv').config()
const express = require('express')
const cors = require('cors')
const {processPayloads} = require('./services/payloadProcessor')
const {connectDatabase} = require('./config/database') // Fixed typo
const {router} = require('./routes/getMessages')

const app = express()
const PORT = process.env.PORT || 3000; // Use consistent variable name

app.use(express.json())
app.use(express.urlencoded({extended: true}))
// app.use(cors({
//   origin: 'http://localhost:5173', // or "*" for development, but use origin whitelist in prod
//   methods: ['GET', 'POST'],
//   credentials: true
// }));
app.use(cors())

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

