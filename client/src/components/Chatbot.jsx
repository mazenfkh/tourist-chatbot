import React, { useState, useRef, useEffect } from 'react';

const formatMessageWithMarkdown = (text) => {
  const lines = text.split('\n');
  
  return (
    <>
      {lines.map((line, index) => {
        const numberedListMatch = line.match(/^(\d+)\.\s+(.*)/);
        const hasBoldText = line.includes('**');
        
        if (numberedListMatch) {
          const [, number, content] = numberedListMatch;
          return (
            <div key={index} className="flex items-start mb-2">
              <div className="flex-shrink-0 bg-indigo-100 text-indigo-600 font-semibold rounded-full w-6 h-6 flex items-center justify-center mr-2">
                {number}
              </div>
              <div className="flex-1">
                {formatBoldText(content)}
              </div>
            </div>
          );
        } else if (hasBoldText) {
          return <div key={index} className="mb-2">{formatBoldText(line)}</div>;
        } else if (line.trim() === '') {
          return <div key={index} className="h-2"></div>;
        } else if (line.trim().startsWith('Remember,')) {
          return (
            <div key={index} className="mt-4 p-3 bg-indigo-50 border-l-4 border-indigo-500 rounded">
              <p className="text-indigo-700">{line}</p>
            </div>
          );
        } else {
          return <div key={index} className="mb-2">{line}</div>;
        }
      })}
    </>
  );
};

const formatBoldText = (text) => {
  if (!text.includes('**')) return text;
  
  const parts = [];
  let lastIndex = 0;
  let inBold = false;
  
  let match;
  const regex = /\*\*/g;
  
  while ((match = regex.exec(text)) !== null) {
    const currentIndex = match.index;
    
    if (currentIndex > lastIndex) {
      parts.push({
        text: text.substring(lastIndex, currentIndex),
        bold: inBold
      });
    }
    
    lastIndex = currentIndex + 2;
    inBold = !inBold;
  }
  
  if (lastIndex < text.length) {
    parts.push({
      text: text.substring(lastIndex),
      bold: inBold
    });
  }
  
  return (
    <>
      {parts.map((part, index) => 
        part.bold ? 
          <span key={index} className="font-semibold text-indigo-800">{part.text}</span> : 
          <span key={index}>{part.text}</span>
      )}
    </>
  );
};

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'sv', name: 'Swedish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
  { code: 'pl', name: 'Polish' },
  { code: 'el', name: 'Greek' },
  { code: 'cs', name: 'Czech' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'ro', name: 'Romanian' },
  { code: 'tr', name: 'Turkish' },
  { code: 'hi', name: 'Hindi' },
  { code: 'th', name: 'Thai' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'id', name: 'Indonesian' },
  { code: 'ms', name: 'Malay' },
  { code: 'tl', name: 'Tagalog' },
  { code: 'he', name: 'Hebrew' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'fa', name: 'Persian' },
  { code: 'bn', name: 'Bengali' },
  { code: 'sw', name: 'Swahili' },
  { code: 'ur', name: 'Urdu' }
];

function Chatbot() {
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: 'Hello! I\'m your tourist assistant. Ask me about attractions, restaurants, or local customs in any city!',
      id: 'welcome-msg'
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const searchInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (showLanguageDropdown) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchTerm('');
    }
  }, [showLanguageDropdown]);

  const handleSend = async (customInput = null) => {
    const messageToSend = customInput || userInput;
    if (!messageToSend.trim()) return;

    const msgId = `user-${Date.now()}`;
    setMessages(prev => [...prev, { sender: 'user', text: messageToSend, id: msgId }]);
    
    if (!customInput) {
      setUserInput('');
    }
    
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      const botReply = data.reply || 'No response';

      setMessages(prev => [...prev, { sender: 'bot', text: botReply, id: `bot-${Date.now()}` }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        { 
          sender: 'bot', 
          text: 'Oops! Something went wrong. Please try again later.',
          id: `error-${Date.now()}`
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleQuickQuestion = (question) => {
    handleSend(question);
  };

  const renderStyledTravelOnlyResponse = () => {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                <path d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-700 leading-relaxed">
              <p>
                I'm a tourist assistant and can only answer questions related to travel, destinations, attractions, restaurants, local customs, or travel advice.
              </p>
              <p className="mt-2 font-medium text-indigo-700">
                How can I help you plan your next trip or explore a destination?
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button 
                onClick={() => handleQuickQuestion("Tell me about popular destinations")}
                className="px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs rounded-full transition-colors"
              >
                Popular destinations
              </button>
              <button 
                onClick={() => handleQuickQuestion("What local cuisines should I try?")}
                className="px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs rounded-full transition-colors"
              >
                Local cuisine
              </button>
              <button 
                onClick={() => handleQuickQuestion("Give me travel tips")}
                className="px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs rounded-full transition-colors"
              >
                Travel tips
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    setShowLanguageDropdown(false);
    setSearchTerm('');
    
    setMessages(prev => [
      ...prev, 
      { 
        sender: 'bot', 
        text: `Language changed to ${LANGUAGES.find(l => l.code === langCode).name}. How can I help you?`,
        id: `lang-${Date.now()}`
      }
    ]);
  };

  const filteredLanguages = LANGUAGES.filter(
    lang => lang.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLanguageDropdown && !event.target.closest('.language-selector')) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageDropdown]);

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl shadow-xl bg-gradient-to-b from-indigo-50 to-white overflow-hidden flex flex-col h-[600px] border border-indigo-100">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-5 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-white bg-opacity-20 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-lg">Tourist Assistant</h2>
            <p className="text-xs text-indigo-100">Your personal travel guide</p>
          </div>
        </div>
        
        <div className="relative language-selector">
          <button 
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            className="px-4 py-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-sm transition-colors duration-200 flex items-center space-x-2 backdrop-blur-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
            </svg>
            <span>{LANGUAGES.find(l => l.code === language).name}</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`h-4 w-4 transition-transform duration-200 ${showLanguageDropdown ? 'rotate-180' : ''}`}>
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>
          
          {showLanguageDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg z-10 overflow-hidden animate-fadeIn ring-1 ring-black ring-opacity-5 border border-indigo-100">
              <div className="p-3 border-b border-indigo-50">
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search language..."
                    className="w-full px-4 py-2 pl-9 text-sm border border-indigo-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 bg-white"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400 absolute left-3 top-2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
              </div>
              
              <div className="max-h-60 overflow-y-auto">
                {filteredLanguages.length > 0 ? (
                  <ul className="py-2">
                    {filteredLanguages.map(lang => (
                      <li 
                        key={lang.code} 
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`px-4 py-2.5 text-sm hover:bg-indigo-50 cursor-pointer transition-colors duration-150 flex items-center ${
                          lang.code === language ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {lang.code === language && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2 text-indigo-600">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                        )}
                        {!lang.code.includes(language) && <div className="w-4 mr-2"></div>}
                        {lang.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">No languages found</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div 
        className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-indigo-50/50 to-white flex flex-col gap-4"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E\")",
        }}
      >
       {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeSlideUp`}
          >
            {msg.sender === 'user' ? (
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm px-5 py-3.5 rounded-2xl max-w-[85%]">
                <div className="text-sm whitespace-pre-line leading-relaxed">
                  {msg.text}
                </div>
              </div>
            ) : (
              msg.text.includes("I'm a tourist assistant and can only answer questions related to travel") ? (
                renderStyledTravelOnlyResponse()
              ) : (
                <div className="bg-white text-gray-700 border border-indigo-100 shadow-md px-5 py-3.5 rounded-2xl max-w-[85%]">
                  <div className="text-sm whitespace-pre-line leading-relaxed">
                    {msg.text.includes('**') || msg.text.includes('1.') || msg.text.includes('2.') || msg.text.includes('3.') 
                      ? formatMessageWithMarkdown(msg.text) 
                      : msg.text}
                  </div>
                </div>
              )
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-fadeIn">
            <div className="px-5 py-4 rounded-2xl bg-white text-gray-700 shadow-sm border border-indigo-100">
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-bounce"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce delay-75"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-indigo-100 bg-white">
        <div className="flex overflow-hidden rounded-full shadow-sm border border-indigo-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 bg-indigo-50/50">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
            placeholder="Ask about attractions, restaurants, events..."
            disabled={isLoading}
            className="flex-1 py-3 px-5 border-0 focus:outline-none focus:ring-0 text-sm bg-transparent"
          />
          <button 
            onClick={() => handleSend()}
            disabled={isLoading || !userInput.trim()}
            className={`px-5 mx-1 my-1 rounded-full transition-all duration-200 flex items-center justify-center ${
              isLoading || !userInput.trim() 
                ? 'bg-indigo-200 text-indigo-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
            }`}
          >
            {isLoading ? (
              <span className="h-5 w-5 block rounded-full border-2 border-t-indigo-200 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            )}
          </button>
        </div>
        
        <div className="mt-2 text-center text-xs text-gray-400">
          Powered by AI • Your personal travel companion
        </div>
      </div>
    </div>
  );
}

export default Chatbot;