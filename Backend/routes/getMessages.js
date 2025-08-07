const express = require('express')
const router = express.Router()
const {getMessage} = require('../controllers/getmessages')

router.get('/api/messages', getMessage)

module.exports = {router}