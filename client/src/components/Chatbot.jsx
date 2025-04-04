import React, { useState } from 'react';

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');

  const handleSend = async () => {
    if (!userInput.trim()) return;

    // Add the user message to the chat
    setMessages((prev) => [...prev, { sender: 'user', text: userInput }]);
    const messageToSend = userInput;
    setUserInput('');

    try {
      // If you have a Vite proxy set up:
      //    fetch('/api/chatbot/ask', {...})
      // Otherwise, specify the full URL:
      //    fetch('http://localhost:5000/api/chatbot/ask', {...})

      const response = await fetch('/api/chatbot/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          language: 'en', // or detect from user or UI
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      const botReply = data.reply || 'No reply';

      // Add the bot message to the chat
      setMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);
    } catch (error) {
      console.error('Error sending message:', error);

      // Optionally display an error message in the UI
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Oops! Something went wrong.' },
      ]);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
      <h2>Chat</h2>
      <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
        {messages.map((msg, i) => (
          <p key={i}>
            <strong>{msg.sender}:</strong> {msg.text}
          </p>
        ))}
      </div>

      <input
        type="text"
        value={userInput}
        placeholder="Ask something..."
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}

export default Chatbot;
