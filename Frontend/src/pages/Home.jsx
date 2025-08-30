import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatInterface';
import Summary from '../components/Summary';

const Home = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am Legal Sahayak, your AI legal assistant. How can I help you with your legal questions today?' }
  ]);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="flex-1 flex flex-col">
        <ChatWindow messages={messages} setMessages={setMessages} />
      </div>
      <Summary messages={messages} />
    </div>
  );
};

export default Home;
