const fs = require('fs');
const path = require('path');
const Message = require('../models/messages');


async function processPayloads() {
  try {
    const payloadDir = path.resolve(__dirname, '../../payloads');
    const files = fs.readdirSync(payloadDir);

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      try {
        const filePath = path.join(payloadDir, file);
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);

        console.log(`Processing file: ${file}`);

        // Basic validation on structure
        if (!parsed.metaData?.entry?.length) {
          console.log(`Skipping ${file} - invalid metaData.entry`);
          continue;
        }

        const entry = parsed.metaData.entry[0];
        if (!entry.changes?.length) {
          console.log(`Skipping ${file} - invalid changes`);
          continue;
        }

        const change = entry.changes[0];
        const value = change.value;

        if (
          !value?.contacts?.length ||
          !value?.messages?.length
        ) {
          console.log(`Skipping ${file} - missing contacts or messages`);
          continue;
        }

        // Extract sender and receiver
        const contact = value.contacts[0];      // Usually the sender info
        const message = value.messages[0];     // The message object

        // Check mandatory fields
        if (!contact.profile?.name || !message.text?.body) {
          console.log(`Skipping ${file} - missing name or message text`);
          continue;
        }

        // Prevent duplicates based on message_id
        const existing = await Message.findOne({ message_id: message.id });
        if (existing) {
          console.log(`Skipping duplicate message: ${message.id}`);
          continue;
        }

        // Define sender_wa_id & receiver_wa_id clearly:
        // - sender_wa_id = contact.wa_id (person who sent the message)
        // - receiver_wa_id = gs_app_id or some constant for your app (you can adjust this)
        // For demo, assuming receiver is your app's wa_id

        const receiver_wa_id = '8866239183';  // Change this to your actual receiver ID or logic
        const timestampRaw = message.timestamp;
        let timestamp = new Date(Number(timestampRaw) * 1000);
        if (isNaN(timestamp)) {
          timestamp = new Date();
        }

        const newMsgData = {
          sender_wa_id: contact.wa_id,
          receiver_wa_id,
          name: contact.profile.name,
          wa_id: contact.wa_id,
          message: message.text.body,
          message_id: message.id,
          payload_type: parsed.payload_type,
          gs_app_id: parsed.metaData.gs_app_id,
          status: 'sent',
          timestamp: timestamp,
        };

        const doc = new Message(newMsgData);
        await doc.save();

        console.log(`✅ Saved message from ${newMsgData.name} (${newMsgData.sender_wa_id})`);

      } catch (fileError) {
        console.error(`Error processing ${file}:`, fileError.message);
        continue;
      }
    }

    console.log('✅ All payloads processed.');

  } catch (err) {
    console.error('Error reading payload directory:', err);
    process.exit(1);
  }
}

module.exports = { processPayloads };
