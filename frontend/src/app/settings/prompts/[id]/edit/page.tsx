'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { PromptForm } from '@/components/prompts/prompt-form';

export default function EditPromptPage() {
  const params = useParams();
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const response = await api.get(`/prompts/${params.id}`);
        setPrompt(response.data.data);
      } catch (error) {
        console.error('Error fetching prompt:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPrompt();
    }
  }, [params.id]);

  if (loading) return <div>Loading...</div>;
  if (!prompt) return <div>Prompt not found</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Edit AI Prompt</h2>
      <PromptForm prompt={prompt} />
    </div>
  );
} 