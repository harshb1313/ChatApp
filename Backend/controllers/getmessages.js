const Message = require('../models/messages')


async function getMessage(req,res){
try {
    const messages = await Message.find()
    res.status(200).json(messages)
} catch (error) {
    console.log('couldnt receive message', error )
}
}

module.exports = {getMessage}