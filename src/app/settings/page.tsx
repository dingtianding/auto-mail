"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const router = useRouter();
  const [systemPrompt, setSystemPrompt] = useState('');
  const [defaultPrompt, setDefaultPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch the current system prompt from the API
    const fetchSystemPrompt = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/settings/prompt');
        const data = await response.json();
        
        if (data.success) {
          setSystemPrompt(data.prompt || '');
          setDefaultPrompt(data.prompt || '');
        } else {
          setError('Failed to load the current prompt');
        }
      } catch (err) {
        setError('Error loading prompt settings');
        console.error('Error fetching prompt:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSystemPrompt();
  }, []);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch('/api/settings/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: systemPrompt }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsSaved(true);
        setDefaultPrompt(systemPrompt);
        setTimeout(() => setIsSaved(false), 3000);
      } else {
        setError(data.error || 'Failed to save prompt');
      }
    } catch (err) {
      setError('Error saving prompt settings');
      console.error('Error saving prompt:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSystemPrompt(defaultPrompt);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">AI Settings</h1>
        <div className="space-x-2">
          <button
            onClick={handleReset}
            disabled={isLoading || systemPrompt === defaultPrompt}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || systemPrompt === defaultPrompt}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {isSaved && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Prompt saved successfully!
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">AI System Prompt</h2>
        <p className="text-gray-600 mb-4">
          Configure the system prompt used by the AI assistant. This prompt defines how the AI behaves and responds to user queries.
        </p>
        
        <div className="mb-4">
          <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700 mb-2">
            System Prompt
          </label>
          <textarea
            id="systemPrompt"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={15}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter the system prompt for the AI assistant..."
            disabled={isLoading}
          />
        </div>
        
        <div className="text-sm text-gray-500">
          <p className="font-medium mb-2">Guidelines for effective prompts:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Define the AI's role clearly (e.g., "You are an assistant for QuickPilot, a business automation platform")</li>
            <li>Specify the tone and style of responses (professional, friendly, concise, etc.)</li>
            <li>Include information about the application's features and capabilities</li>
            <li>Set boundaries for what the AI should and shouldn't answer</li>
            <li>Provide examples of good responses if helpful</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">AI Model Settings</h2>
        <p className="text-gray-600">
          Advanced AI model configuration options will be available soon.
        </p>
      </div>
    </div>
  );
} 