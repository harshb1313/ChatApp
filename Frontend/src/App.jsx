import React, { useState, useEffect } from 'react';
import './App.css'; // Import the CSS file

function App() {
  const myNumber = '8866239183';
  
  // App state - what's happening right now
  const [allChats, setAllChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Load all chats when app starts
  useEffect(() => {
    loadAllChats();
  }, []);

  // Get list of all my chats
  const loadAllChats = async () => {
    try {
      const response = await fetch('http://localhost:3000/chats');
      const chats = await response.json();
      setAllChats(chats);
    } catch (error) {
      console.log('Could not load chats:', error);
    }
  };

  // When I click on a chat, show me the messages
  const openChat = async (person) => {
    setIsLoadingMessages(true);
    setCurrentChat(person);
    
    try {
      const response = await fetch(`http://localhost:3000/api/messages/${person.wa_id}`);
      const messages = await response.json();
      setChatMessages(messages);
    } catch (error) {
      console.log('Could not load messages:', error);
    }
    
    setIsLoadingMessages(false);
  };

  // Send a message to the current person
  const sendMyMessage = async () => {
    // Don't send empty messages
    if (!newMessage.trim() || !currentChat) return;

    // Show the message right away (optimistic update)
    const tempMessage = {
      _id: 'temp-' + Date.now(),
      sender_wa_id: myNumber,
      receiver_wa_id: currentChat.wa_id,
      message: newMessage.trim(),
      status: 'sending',
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, tempMessage]);
    setNewMessage(''); // Clear the input

    try {
      const response = await fetch('http://localhost:3000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver_wa_id: currentChat.wa_id,
          message: newMessage.trim(),
        })
      });

      if (response.ok) {
        // Refresh messages to get the real message
        openChat(currentChat);
        loadAllChats(); // Update the chat list too
      } else {
        throw new Error('Failed to send');
      }
    } catch (error) {
      console.log('Could not send message:', error);
      // Remove the temp message if it failed
      setChatMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
      alert('Message failed to send');
    }
  };

  // Handle Enter key in message input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMyMessage();
    }
  };

  // Format time for display
  const showTime = (timestamp) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    
    // If it's today, show time like "2:30 PM"
    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // If it's yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Otherwise show the date
    return messageDate.toLocaleDateString();
  };

  // Show status icons for my messages
  const getStatusIcon = (status) => {
    if (status === 'sending') return '⏳';
    if (status === 'sent') return '✓';
    if (status === 'delivered') return '✓✓';
    if (status === 'read') return '✓✓';
    return '✓';
  };

  // Check if we're on mobile
  const isMobile = window.innerWidth <= 768;

  return (
    <div className="app-container">

      {/* Left side - Chat List */}
      <div className={`chat-list-sidebar ${isMobile && currentChat ? 'mobile-hidden' : ''}`}>
        
        {/* Header */}
        <div className="chat-list-header">
          <h2>My Chats</h2>
        </div>

        {/* Chat List */}
        <div className="chat-list-scroll">
          {allChats.map((person) => (
            <div
              key={person.wa_id}
              onClick={() => openChat(person)}
              className={`chat-item ${currentChat?.wa_id === person.wa_id ? 'active' : ''}`}
            >
              
              {/* Avatar */}
              <div className="chat-avatar">
                {(person.name || person.wa_id).charAt(0).toUpperCase()}
              </div>

              {/* Chat Info */}
              <div className="chat-info">
                <div className="chat-name">
                  {person.name || person.wa_id}
                </div>
                
                <div className="chat-last-message">
                  {person.lastMessage || 'No messages yet'}
                </div>
              </div>

              {/* Time */}
              <div className="chat-time">
                {person.lastTimestamp && showTime(person.lastTimestamp)}
              </div>
            </div>
          ))}

          {allChats.length === 0 && (
            <div className="no-chats">
              <div className="no-chats-icon">💬</div>
              <p>No chats yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Current Chat */}
      <div className={`chat-main ${isMobile && !currentChat ? 'mobile-hidden' : ''}`}>

        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              
              {/* Back button for mobile */}
              {isMobile && (
                <button
                  onClick={() => setCurrentChat(null)}
                  className="back-button"
                >
                  ←
                </button>
              )}

              <div className="contact-info">
                <div className="contact-name">
                  {currentChat.name || currentChat.wa_id}
                </div>
                
                <div className="contact-number">
                  {currentChat.wa_id}
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="messages-area">
              
              {isLoadingMessages ? (
                <div className="loading-messages">
                  Loading messages...
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`message ${msg.sender_wa_id === myNumber ? 'sent' : 'received'}`}
                  >
                    
                    {/* Message Text */}
                    <div className="message-text">
                      {msg.message}
                    </div>

                    {/* Time and Status */}
                    <div className="message-meta">
                      <span className="message-time">{showTime(msg.timestamp)}</span>
                      {msg.sender_wa_id === myNumber && (
                        <span className="message-status">{getStatusIcon(msg.status)}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="message-input-container">
              
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="message-input"
                rows={1}
              />

              <button
                onClick={sendMyMessage}
                disabled={!newMessage.trim()}
                className="send-button"
              >
                ➤
              </button>
            </div>
          </>
        ) : (
          // No chat selected
          <div className="no-chat-selected">
            <div className="no-chat-icon">💬</div>
            <h2>WhatsApp Web</h2>
            <p>Click on a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;