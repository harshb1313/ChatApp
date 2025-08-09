require('dotenv').config()
const express = require('express')
const cors = require('cors')
const {processPayloads} = require('./services/payloadProcessor')
const {connectDatabase} = require('./config/database') // Fixed typo
const {addUser} = require('./config/user')
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
app.use((req, res, next) => {
  // console.log(`Request: ${req.method} ${req.url}`);
  next();
});
app.use(router)


app.get('/', (req, res) => {
    res.json({ message: 'ChatApp Backend is running!' });
});

connectDatabase()
  .then(async () => {
    // console.log('✅ Database connected successfully');
    
    // Ensure your app user exists
    await addUser();

    // Process existing payloads on startup (optional)
    await processPayloads();
    
    // Start the server
    app.listen(PORT, () => {
        // console.log(`🚀 Server running on port ${PORT}`);
    });
})


// app.listen(PORT,()=>(console.log(PORT,'active')))

