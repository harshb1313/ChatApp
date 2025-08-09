const express = require('express')
const router = express.Router()
const { getMessage, sendMessage, getChats, getMessagesForChat } = require('../controllers/getmessages')

router.get('/api/messages', getMessage)
router.post('/api/messages', (req, res, next) => {
    console.log('📍 Route /api/messages matched!');
    next();
}, sendMessage)
router.get('/chats', getChats)
router.get('/api/messages/:wa_id', getMessagesForChat)

module.exports = { router } 