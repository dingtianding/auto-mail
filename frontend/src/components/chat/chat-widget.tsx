"use client"

import { useState } from "react"
import { MessageSquare, X, Send } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

const HELP_OPTIONS = [
  "How do I import data?",
  "How can I export reports?",
  "Tell me about templates",
]

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "👋 Hi! I'm your AI assistant. I can help you with imports, exports, templates, and more. What would you like to know?"
  }])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      })
      
      const data = await response.json()
      setMessages(prev => [...prev, { role: "assistant", content: data.message }])
    } catch (error) {
      console.error("Chat error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickOption = (option: string) => {
    setInput(option)
    handleSubmit({ preventDefault: () => {} } as React.FormEvent)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl border">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">AI Assistant</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 rounded-lg p-3">
              Thinking...
            </div>
          </div>
        )}
        
        {/* Quick Options */}
        {messages.length === 1 && (
          <div className="space-y-2">
            {HELP_OPTIONS.map((option, index) => (
              <button
                key={index}
                onClick={() => handleQuickOption(option)}
                className="w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  )
} 