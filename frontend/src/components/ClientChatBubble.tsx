"use client"

import { useEffect } from 'react'
import ChatBubble from '../../components/ChatBubble'

export default function ClientChatBubble() {
  useEffect(() => {
    // Find all chat bubble elements
    const chatBubbles = document.querySelectorAll('[aria-label="Open chat assistant"]')
    console.log('Found', chatBubbles.length, 'chat bubbles')
    
    // Log their IDs to help identify them
    chatBubbles.forEach((bubble, index) => {
      console.log(`Chat bubble ${index}:`, bubble.id || 'No ID', bubble)
    })
    
    // Optional: Hide the old one if we can identify it
    if (chatBubbles.length > 1) {
      // The one without our specific ID is likely the old one
      chatBubbles.forEach(bubble => {
        if (bubble.id !== 'new-chat-bubble') {
          console.log('Hiding old chat bubble:', bubble)
          bubble.style.display = 'none'
        }
      })
    }
  }, [])

  return <ChatBubble />
} 