'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function NewDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    content: '',
    title: 'Payment Reminder',
    document_type: 'payment_reminder'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post(`/customers/${params.id}/mailing_documents`, {
        mailing_document: formData
      });
      router.push(`/customers/${params.id}`);
    } catch (error: any) {
      console.error('Error creating document:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to create document');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLetter = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/customers/${params.id}/generate_letter`, {
        type: 'payment_reminder'
      });
      
      if (response.data.content) {
        setFormData(prev => ({
          ...prev,
          content: response.data.content
        }));
      }
    } catch (error: any) {
      console.error('Failed to generate letter:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to generate payment reminder letter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">New Payment Reminder</h1>
        <Button
          variant="outline"
          onClick={() => router.push(`/customers/${params.id}`)}
        >
          Back to Customer
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Document Title"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="content">Content</Label>
              <Button 
                type="button"
                variant="secondary"
                onClick={handleGenerateLetter}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'AI Generate'}
              </Button>
            </div>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Click 'AI Generate' to create a payment reminder letter..."
              rows={10}
              required
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="submit"
              disabled={loading || !formData.content.trim()}
            >
              {loading ? 'Creating...' : 'Create Document'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 