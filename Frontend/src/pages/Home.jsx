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

  const neumorph = darkMode
    ? "shadow-[inset_4px_4px_10px_#1a1a1a,inset_-4px_-4px_10px_#2c2c2c]"
    : "shadow-[inset_4px_4px_10px_#d1d9e6,inset_-4px_-4px_10px_#ffffff]";
  const bgColor = darkMode ? "bg-[#1e1e1e]" : "bg-[#f1f3f6]";
  const cardColor = darkMode ? "bg-[#252525]" : "bg-[#e2e8f0]";
  const textColor = darkMode ? "text-white" : "text-gray-800";
  const borderColor = darkMode ? "border-[#2c2c2c]" : "border-gray-300";

  const theme = { darkMode, setDarkMode, neumorph, bgColor, cardColor, textColor, borderColor };

  return (
    <div className={`flex h-screen w-full ${bgColor} ${textColor} overflow-hidden p-4 gap-4`}>
      <Sidebar theme={theme} />
      <div className="flex-1 flex flex-col">
        <ChatWindow messages={messages} setMessages={setMessages} theme={theme} />
      </div>
      <Summary messages={messages} theme={theme} />
    </div>
  );
};

export default Home;
