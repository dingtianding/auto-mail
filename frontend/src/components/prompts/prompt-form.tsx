'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface PromptFormProps {
  prompt?: {
    id: number;
    name: string;
    content: string;
    category: string;
    active: boolean;
    description: string;
    parameters: any;
    version: number;
  };
}

export function PromptForm({ prompt }: PromptFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: prompt?.name || '',
    content: prompt?.content || '',
    category: prompt?.category || 'chat',
    active: prompt?.active ?? true,
    description: prompt?.description || '',
    parameters: prompt?.parameters || {},
    version: prompt?.version || 1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (prompt?.id) {
        await api.put(`/prompts/${prompt.id}`, { prompt: formData });
      } else {
        await api.post('/prompts', { prompt: formData });
      }
      router.push('/prompts');
    } catch (error) {
      console.error('Error saving prompt:', error);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Name</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block mb-2">Category</label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chat">Chat</SelectItem>
              <SelectItem value="document_analysis">Document Analysis</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block mb-2">Content</label>
          <Textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={10}
            required
          />
        </div>

        <div>
          <label className="block mb-2">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.active}
            onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
          />
          <label>Active</label>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/prompts')}
          >
            Cancel
          </Button>
          <Button type="submit">
            {prompt ? 'Update' : 'Create'} Prompt
          </Button>
        </div>
      </form>
    </Card>
  );
} 