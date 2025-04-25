import React from 'react';
import Chat from '../components/Chat';

const ChatPage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">AI Assistant</h1>
      <p className="text-gray-600 mb-6">Ask me anything about financial automation!</p>
      <Chat />
    </div>
  );
};

export default ChatPage; 