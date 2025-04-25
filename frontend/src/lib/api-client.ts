const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function fetchCustomers() {
  try {
    const res = await fetch(`${API_BASE}/api/customers`)
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }
    const data = await res.json()
    return data
  } catch (error) {
    console.error('Error fetching customers:', error)
    return []
  }
}

export async function createCustomer(data: Partial<Customer>) {
  const res = await fetch(`${API_BASE}/api/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create customer')
  return res.json()
} 