"use client";
import { useState } from 'react';
import api from '@/lib/api';

interface DocumentFormProps {
  customerId: number;
  onSuccess: () => void;
}

export function DocumentForm({ customerId, onSuccess }: DocumentFormProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/customers/${customerId}/documents`, {
        document: { content }
      });
      setContent('');
      onSuccess();
    } catch (error) {
      console.error('Error creating document:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Document Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border rounded min-h-[200px]"
          placeholder="Enter document content..."
        />
      </div>
      <button 
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
      >
        {loading ? 'Generating...' : 'Generate Document'}
      </button>
    </form>
  );
} 