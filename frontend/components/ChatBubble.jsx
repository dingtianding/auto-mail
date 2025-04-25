"use client"

import React, { useState, useRef, useEffect } from 'react';
import Chat from './Chat';

const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const chatContainerRef = useRef(null);

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatContainerRef.current && !chatContainerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={chatContainerRef}>
      {/* Chat Interface */}
      {isOpen && (
        <div 
          className={`mb-4 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded 
              ? 'w-[90vw] md:w-[600px] lg:w-[800px] h-[80vh]' 
              : 'w-[350px] md:w-[450px] h-[500px]'
          }`}
        >
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <h3 className="font-medium">AI Assistant</h3>
            <div className="flex items-center space-x-2">
              <button 
                onClick={toggleExpand}
                className="text-white hover:bg-blue-700 rounded-full p-1"
                aria-label={isExpanded ? "Minimize chat" : "Expand chat"}
              >
                {isExpanded ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-blue-700 rounded-full p-1"
                aria-label="Close chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden h-[calc(100%-56px)]">
            <Chat onNewMessage={() => !isExpanded && setIsExpanded(true)} />
          </div>
        </div>
      )}

      {/* Chat Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all"
        aria-label="Open chat assistant"
        id="new-chat-bubble"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default ChatBubble; 