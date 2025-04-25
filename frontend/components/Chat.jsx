"use client"

import React, { useState, useRef, useEffect } from 'react';

const Chat = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Format message content with markdown-like syntax
  const formatMessage = (content) => {
    if (!content) return '';
    
    // Replace newlines with <br> tags
    let formatted = content.replace(/\n/g, '<br>');
    
    // Format code blocks
    formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-800 text-white p-3 rounded my-2 overflow-x-auto"><code>$1</code></pre>');
    
    // Format inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-gray-200 px-1 rounded">$1</code>');
    
    // Format bold text
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Format italic text
    formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Format lists
    formatted = formatted.replace(/^\s*-\s+(.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>)/gs, '<ul class="list-disc pl-5 my-2">$1</ul>');
    
    return formatted;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    setInput('');
    
    try {
      console.log('Sending message to API:', userMessage);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });
      
      console.log('API response status:', response.status);
      
      const data = await response.json();
      console.log('API response data:', data);
      
      if (data.success) {
        // Get the response directly from the response field
        const assistantMessage = data.response || 'I received your message but got an empty response.';
        setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
      } else {
        console.error('API error:', data.error || 'Unknown error');
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Error: ${data.error || 'Something went wrong. Please try again.'}` 
        }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Network error: ${error.message}. Please check your connection and try again.` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`max-w-[80%] p-3 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-500 text-white self-end' 
                : 'bg-gray-100 text-gray-800 self-start'
            }`}
          >
            <div 
              dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }} 
              className="prose prose-sm max-w-none"
            />
          </div>
        ))}
        {loading && (
          <div className="bg-gray-100 text-gray-800 self-start max-w-[80%] p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 border-t border-gray-200 mt-auto">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button 
            onClick={sendMessage} 
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-full disabled:bg-gray-300"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat; 