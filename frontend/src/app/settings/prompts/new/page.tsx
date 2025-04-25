'use client';

import { PromptForm } from '@/components/prompts/prompt-form';

export default function NewPromptPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">New AI Prompt</h2>
      <PromptForm />
    </div>
  );
} 