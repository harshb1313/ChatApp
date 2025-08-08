import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/messages');
      console.log('Response:', res.data);
      setMessages(res.data); // make sure this matches your backend field name
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
     e.preventDefault();

  if (!message.trim()) return;

  const newMessage = {
    text: message,
    wa_id: 'user12345', // Replace this with actual wa_id (or get it dynamically)
    timestamp: new Date().toISOString(),
    status: 'sent',
  };

  await axios.post('http://localhost:3000/api/messages', newMessage);

  setMessage('');
  };

  return (
    <div>
      <input value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={sendMessage}>Send</button>

      <div>
        <h2>Messages</h2>
        <ul>
          {messages.map((msg) => (
            <li key={msg._id}>
              <strong>{msg.wa_id}:</strong> {msg.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;

