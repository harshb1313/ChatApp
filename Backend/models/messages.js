const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    sender_wa_id: { type: String, required: true },
    receiver_wa_id: { type: String, required: true },
    message: String,
    message_id: String,
    payload_type: String,
    gs_app_id: String,
    status: { type: String, default: 'sent' },
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message