const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    name: String,
    wa_id: String,
    message: String,
    message_id: String,
    payload_type: String,
    gs_app_id: String,
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message