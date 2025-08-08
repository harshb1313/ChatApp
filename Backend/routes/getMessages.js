const express = require('express')
const router = express.Router()
const {getMessage,sendMessage} = require('../controllers/getmessages')

router.get('/api/messages', getMessage)
router.post('/api/messages',sendMessage)

module.exports = {router}