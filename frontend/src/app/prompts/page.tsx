'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Prompt {
  id: number;
  name: string;
  category: string;
  content: string;
  active: boolean;
  description: string;
  version: number;
  created_at: string;
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await api.get('/prompts');
      setPrompts(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this prompt?')) {
      try {
        await api.delete(`/prompts/${id}`);
        fetchPrompts();
      } catch (error) {
        console.error('Error deleting prompt:', error);
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">AI Prompts</h1>
        <Button 
          onClick={() => router.push('/prompts/new')}
          className="bg-blue-500 hover:bg-blue-600"
        >
          New Prompt
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prompts.map((prompt) => (
              <TableRow key={prompt.id}>
                <TableCell>{prompt.name}</TableCell>
                <TableCell>
                  <Badge variant={prompt.category === 'system' ? 'default' : 'secondary'}>
                    {prompt.category}
                  </Badge>
                </TableCell>
                <TableCell>v{prompt.version}</TableCell>
                <TableCell>
                  <Badge variant={prompt.active ? 'success' : 'secondary'}>
                    {prompt.active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/prompts/${prompt.id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500"
                    onClick={() => handleDelete(prompt.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
} 