"use client"

import { useState } from "react"
import api from "@/lib/api"

interface CustomerFormProps {
  onSuccess: () => void
}

export function CustomerForm({ onSuccess }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phone: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post("/customers", { customer: formData })
      onSuccess()
      setFormData({ name: "", email: "", address: "", phone: "" })
    } catch (error) {
      console.error("Error creating customer:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Phone</label>
        <input
          type="text"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full p-2 border rounded"
        />
      </div>
      <button 
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add Customer
      </button>
    </form>
  )
} 