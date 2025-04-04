import React from 'react';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <>
      <header className="text-center max-w-6xl mx-auto p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Multilingual Tourist Chatbot</h1>
        <p className="text-gray-600">Ask about attractions, restaurants, events, and local customs in any language!</p>
      </header>
      
      <main className="flex justify-center items-start max-w-6xl mx-auto px-4 md:px-8">
        <Chatbot />
      </main>
    </>
  );
}

export default App;