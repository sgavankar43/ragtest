import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatInterface';
import Summary from '../components/Summary';

const Home = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am Legal Sahayak, your AI legal assistant. How can I help you with your legal questions today?' }
  ]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatWindow messages={messages} setMessages={setMessages} />
      </div>
      <Summary messages={messages} />
    </div>
  );
};

export default Home;
