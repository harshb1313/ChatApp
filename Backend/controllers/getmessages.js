const Message = require('../models/messages')
const User = require('../models/user')


async function getMessage(req, res) {
  try {
    const messages = await Message.find()
    res.status(200).json(messages)
  } catch (error) {
    console.log('couldnt receive message', error)
  }
}

const sendMessage = async (req, res) => {
  console.log('🚀 sendMessage controller reached!', req.body);
  try {
    const appUserWaId = '8866239183'; // your app's wa_id
    const { receiver_wa_id, message } = req.body;

    if (!receiver_wa_id || !message) {
      return res.status(400).json({ error: 'receiver_wa_id and message are required' });
    }

    // Optional: verify receiver exists
    let receiverUser = await User.findOne({ wa_id: receiver_wa_id });
    if (!receiverUser) {
      console.log('🆕 Creating new user:', receiver_wa_id);
      receiverUser = new User({
        wa_id: receiver_wa_id,
        name: `User ${receiver_wa_id}` // or just receiver_wa_id
      });
      await receiverUser.save();
    }

    const senderUser = await User.findOne({ wa_id: appUserWaId });

    const newMessage = new Message({
      sender_wa_id: appUserWaId,
      receiver_wa_id,
      name: senderUser?.name || 'You',
      message,
      status: 'sent',
      timestamp: new Date()
    });

    const saved = await newMessage.save();
    res.status(201).json(saved);

  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const getChats = async (req, res) => {
  try {
    const appUserWaId = '8866239183';

    const chats = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender_wa_id: appUserWaId },
            { receiver_wa_id: appUserWaId }
          ]
        }
      },
      {
        $project: {
          other_wa_id: {
            $cond: [
              { $eq: ['$sender_wa_id', appUserWaId] },
              '$receiver_wa_id',
              '$sender_wa_id'
            ]
          },
          message: 1,
          status: 1,
          timestamp: 1
        }
      },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$other_wa_id',
          lastMessage: { $first: '$message' },
          lastStatus: { $first: '$status' },
          lastTimestamp: { $first: '$timestamp' }
        }
      },
      { $sort: { lastTimestamp: -1 } }
    ]);

    // Now fetch user info for each chat partner
    const waIds = chats.map(chat => chat._id);
    const users = await User.find({ wa_id: { $in: waIds } });

    // Merge user info with chat summary
    const chatList = chats.map(chat => {
      const user = users.find(u => u.wa_id === chat._id);
      return {
        wa_id: chat._id,
        name: user?.name || 'Unknown',
        lastMessage: chat.lastMessage,
        lastStatus: chat.lastStatus,
        lastTimestamp: chat.lastTimestamp
      };
    });

    res.json(chatList);

  } catch (err) {
    console.error('Get chats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMessagesForChat = async (req, res) => {
  try {
    const appUserWaId = '8866239183';
    const otherWaId = req.params.wa_id;

    const messages = await Message.find({
      $or: [
        { sender_wa_id: appUserWaId, receiver_wa_id: otherWaId },
        { sender_wa_id: otherWaId, receiver_wa_id: appUserWaId }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error('Get messages for chat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getMessage, sendMessage, getChats, getMessagesForChat }