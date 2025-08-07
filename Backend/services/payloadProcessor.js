const fs = require('fs');
const path = require('path');
const Message = require('../models/messages');

async function processPayloads() {
    try {
        const files = fs.readdirSync('../payloads');
        
        for (const file of files) {
            // Skip non-JSON files
            if (!file.endsWith('.json')) continue;
            
            try {
                const filePath = path.join('../payloads', file);
                const readFile = fs.readFileSync(filePath, 'utf-8');
                const parsed = JSON.parse(readFile);

                console.log(`Processing file: ${file}`);

                // Check if the expected structure exists
                if (!parsed.metaData || 
                    !parsed.metaData.entry || 
                    !Array.isArray(parsed.metaData.entry) || 
                    parsed.metaData.entry.length === 0) {
                    console.log(`Skipping ${file} - Invalid metaData.entry structure`);
                    continue;
                }

                const entry = parsed.metaData.entry[0];
                if (!entry.changes || 
                    !Array.isArray(entry.changes) || 
                    entry.changes.length === 0) {
                    console.log(`Skipping ${file} - Invalid changes structure`);
                    continue;
                }

                const change = entry.changes[0];
                if (!change.value || 
                    !change.value.contacts || 
                    !change.value.messages ||
                    !Array.isArray(change.value.contacts) ||
                    !Array.isArray(change.value.messages) ||
                    change.value.contacts.length === 0 ||
                    change.value.messages.length === 0) {
                    console.log(`Skipping ${file} - Invalid contacts/messages structure`);
                    continue;
                }

                const value = change.value;
                const contact = value.contacts[0];
                const message = value.messages[0];

                // Additional safety checks
                if (!contact.profile || !contact.profile.name || 
                    !message.text || !message.text.body) {
                    console.log(`Skipping ${file} - Missing required contact or message data`);
                    continue;
                }

                const specificData = {
                    name: contact.profile.name,
                    wa_id: contact.wa_id,
                    message: message.text.body,
                    message_id: message.id,
                    payload_type: parsed.payload_type,
                    gs_app_id: parsed.metaData.gs_app_id
                };

                const doc = new Message(specificData);
                await doc.save();
                console.log(`✅ Saved message from ${specificData.name}`);

            } catch (fileError) {
                console.error(`Error processing file ${file}:`, fileError.message);
                // Continue with next file instead of stopping
                continue;
            }
        }

        console.log('✅ All valid payloads processed and stored in MongoDB.');
        // process.exit(0);
        
    } catch (error) {
        console.error('Error in processPayloads:', error);
        process.exit(1);
    }
}

module.exports = {processPayloads}