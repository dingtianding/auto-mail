import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import api from '@/lib/api';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  error?: boolean;
}

export default function AIChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setDebugInfo(null);
    
    try {
      // Send message to API
      const response = await api.post('/api/chat', { message: input });
      
      // Log the full response for debugging
      console.log('API response:', response);
      
      // Store debug info
      setDebugInfo(JSON.stringify(response.data, null, 2));
      
      if (response.data.success) {
        const aiContent = response.data.response;
        
        // Check if response is empty or undefined
        if (!aiContent || aiContent.trim() === '') {
          console.error('Empty response received from API');
          
          const errorMessage: Message = {
            id: Date.now().toString(),
            content: "I received an empty response. Please try again or contact support if this persists.",
            sender: 'ai',
            timestamp: new Date(),
            error: true
          };
          
          setMessages(prev => [...prev, errorMessage]);
        } else {
          // Add AI response to chat
          const aiMessage: Message = {
            id: Date.now().toString(),
            content: aiContent,
            sender: 'ai',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, aiMessage]);
        }
      } else {
        // Handle error
        const errorMessage: Message = {
          id: Date.now().toString(),
          content: response.data.error || "Sorry, something went wrong. Please try again.",
          sender: 'ai',
          timestamp: new Date(),
          error: true
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Add error message to chat
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: `Sorry, I'm having trouble connecting to the server. Please try again later. ${error.message || ''}`,
        sender: 'ai',
        timestamp: new Date(),
        error: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-white">
      <div className="p-3 bg-primary text-white font-medium flex justify-between items-center">
        <span>AI Assistant</span>
        {process.env.NODE_ENV === 'development' && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:text-white hover:bg-primary/80"
            onClick={() => setDebugInfo(debugInfo ? null : 'Click after sending a message to see debug info')}
          >
            Debug
          </Button>
        )}
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 my-8">
            <p>How can I help you today?</p>
            <p className="text-sm mt-2">Ask me anything about your business, documents, or invoices.</p>
          </div>
        ) : (
          messages.map(message => (
            <div 
              key={message.id} 
              className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div 
                className={`inline-block p-3 rounded-lg max-w-[80%] ${
                  message.sender === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : message.error
                      ? 'bg-red-50 text-red-800 border border-red-200 rounded-tl-none'
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}
              >
                {message.error && (
                  <div className="flex items-center mb-1 text-red-500">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">Error</span>
                  </div>
                )}
                {message.content}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
        
        {debugInfo && (
          <div className="mt-4 p-3 bg-gray-800 text-gray-200 rounded text-xs overflow-x-auto">
            <pre>{debugInfo}</pre>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-3">
        <div className="flex space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || input.trim() === ''}
            size="icon"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
} 