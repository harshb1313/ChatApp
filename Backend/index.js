require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { processPayloads } = require('./services/payloadProcessor');
const { connectDatabase } = require('./config/database');
const { addUser } = require('./config/user');
const { router } = require('./routes/getMessages');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(router);

app.get('/', (req, res) => {
  res.json({ message: 'ChatApp Backend is running!' });
});

connectDatabase()
  .then(async () => {
    console.log('✅ Database connected successfully');

    try {
      await addUser();
      await processPayloads();
    } catch (startupError) {
      console.error('Error during startup tasks:', startupError);
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  });

// Catch unhandled exceptions/rejections globally
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
