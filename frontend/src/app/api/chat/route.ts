import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { message } = await request.json()
    console.log('Next.js API received message:', message)
    
    // Point to Rails backend on port 3001
    const railsBackendUrl = 'http://localhost:3001'
    const apiUrl = `${railsBackendUrl}/api/chat`
    
    console.log('Forwarding request to Rails backend:', apiUrl)
    
    // Call your Rails backend
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ message }),
    })
    
    if (!response.ok) {
      console.error('Backend API error:', response.status, response.statusText)
      try {
        const errorText = await response.text()
        console.error('Error details:', errorText)
      } catch (e) {
        console.error('Could not read error response')
      }
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('Backend API response:', data)
    
    // Return the data from Rails
    return NextResponse.json(data)
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to process message" },
      { status: 500 }
    )
  }
} 