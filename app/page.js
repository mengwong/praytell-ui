'use client'

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function PrayTellUI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userInfo] = useState({
    name: 'John Doe',
    location: 'New York, USA',
    avatarUrl: '/api/placeholder/40/40'
  });

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const startCountdown = () => {
    setCountdown(10);
    setIsDarkMode(true);
  };

  useEffect(() => {
    let timer;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setIsDarkMode(false);
      triggerConfetti();
      sendMessage();
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    startCountdown();
  };

  const sendMessage = async () => {
    setIsLoading(true);
    const currentDateTime = new Date().toISOString();

    // Add user message to the chat
    const userMessage = { role: 'user', content: input, datetime: currentDateTime };
    setMessages(prevMessages => [...prevMessages, userMessage]);

    try {
      // Process message with AI, including context from Weaviate
      const response = await fetch('/api/chat-with-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input, 
          location: userInfo.location, 
          datetime: currentDateTime 
        }),
      });
      const { reply, context } = await response.json();

      // Add AI response to the chat
      const aiMessage = { role: 'assistant', content: reply, datetime: new Date().toISOString() };
      setMessages(prevMessages => [...prevMessages, aiMessage]);

      // Display context if available
      if (context && context.length > 0) {
        const contextMessage = { 
          role: 'system', 
          content: 'Relevant context:\n' + context.map(c => 
            `Message: ${c.content}\nLocation: ${c.location}\nDatetime: ${c.datetime}`
          ).join('\n\n')
        };
        setMessages(prevMessages => [...prevMessages, contextMessage]);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage = { role: 'system', content: 'Error processing message. Please try again.' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    }

    setIsLoading(false);
    setInput('');
    setCountdown(null);
  };

  useEffect(() => {
    const saveMessage = async () => {
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role !== 'system') {  // Don't save system messages (context)
          await fetch('/api/save-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              message: lastMessage.content, 
              role: lastMessage.role,
              location: userInfo.location,
              datetime: lastMessage.datetime
            }),
          });
        }
      }
    };

    saveMessage();
  }, [messages, userInfo.location]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-red-100' : 'bg-gray-100 text-gray-900'} p-4 transition-colors duration-500`}>
      <style jsx>{`
        @keyframes vibrate {
          0% { transform: translate(2px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(0px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(2px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(2px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .vibrate {
          animation: vibrate 0.3s linear infinite;
        }
        .grow {
          transition: all 0.5s ease-in-out;
        }
      `}</style>
      <div className="container mx-auto max-w-2xl">
        <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-red-500' : 'text-blue-500'}`}>PrayTell UI</h1>
        
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg mb-4 flex items-center transition-colors duration-500`}>
          <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-red-700' : 'bg-blue-500'} mr-4 flex items-center justify-center text-white font-bold transition-colors duration-500`}>
            {userInfo.name[0]}
          </div>
          <div>
            <h2 className={`font-semibold ${isDarkMode ? 'text-red-300' : 'text-gray-800'}`}>{userInfo.name}</h2>
            <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-gray-600'}`}>{userInfo.location}</p>
          </div>
        </div>
        
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow mb-4 overflow-y-auto max-h-96 transition-colors duration-500`}>
          {messages.map((m, index) => (
            <div key={index} className={`mb-4 ${m.role === 'system' ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-100') : ''} p-2 rounded`}>
              <p className={`font-semibold ${isDarkMode ? 'text-red-400' : 'text-blue-600'}`}>
                {m.role === 'user' ? 'You' : m.role === 'assistant' ? 'AI' : 'System'}:
              </p>
              <p className={isDarkMode ? 'text-red-200' : 'text-gray-800'}>{m.content}</p>
              {m.datetime && <p className={`text-xs ${isDarkMode ? 'text-red-500' : 'text-gray-500'}`}>{new Date(m.datetime).toLocaleString()}</p>}
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSubmit} className="mt-4 flex">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className={`flex-grow mr-2 p-2 border rounded ${
              isDarkMode 
                ? 'bg-gray-800 text-red-100 border-red-700 focus:outline-none focus:border-red-500' 
                : 'bg-white text-gray-900 border-gray-300 focus:outline-none focus:border-blue-500'
            } transition-colors duration-500`}
            disabled={isLoading || countdown !== null}
          />
          <button 
            type="submit" 
            className={`${
              isDarkMode ? 'bg-red-700 text-white' : 'bg-blue-500 text-white'
            } px-4 py-2 rounded ${countdown !== null ? 'vibrate' : ''} grow transition-all duration-500`} 
            disabled={isLoading || countdown !== null}
            style={{
              transform: countdown !== null ? `scale(${1 + (10 - countdown) * 0.5})` : 'scale(1)',
              minWidth: countdown !== null ? '120px' : '30px',
              minHeight: countdown !== null ? '75px' : '20px'
            }}
          >
            {countdown !== null ? countdown : (isLoading ? 'Sending...' : 'Send')}
          </button>
        </form>
      </div>
    </div>
  );
}