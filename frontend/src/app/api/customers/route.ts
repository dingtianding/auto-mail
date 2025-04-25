import { NextResponse } from 'next/server'

// Temporary data store
let customers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    address: '123 Main St',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export async function GET() {
  return NextResponse.json(customers)
}

export async function POST(request: Request) {
  const data = await request.json()
  
  const newCustomer = {
    id: String(customers.length + 1),
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  
  customers.push(newCustomer)
  
  return NextResponse.json(newCustomer, { status: 201 })
} 