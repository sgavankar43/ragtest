import React from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatInterface';

const Home = () => {
  return (
    <>
    <div>
      <Sidebar />
      
    </div>
    <div>
      <ChatWindow />
    </div>
    </>
  );
};

export default Home;
