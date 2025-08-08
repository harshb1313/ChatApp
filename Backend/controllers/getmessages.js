const Message = require('../models/messages')
const {getDB} = require('../config/database')


async function getMessage(req,res){
try {
    const messages = await Message.find()
    res.status(200).json(messages)
} catch (error) {
    console.log('couldnt receive message', error )
}
}

const sendMessage = async (req, res) => {
  try {
    const { name, wa_id, text, message_id, payload_type, gs_app_id } = req.body;

    const newMessage = new Message({
  name,
  wa_id,
  message: text,  // 👈 use 'text' from frontend and map to 'message' in DB
  message_id,
  payload_type,
  gs_app_id
});

    const savedMessage = await newMessage.save();

    res.status(201).json({ message: 'Message saved', data: savedMessage });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: 'DB insert failed' });
  }
};
module.exports = {getMessage,sendMessage}