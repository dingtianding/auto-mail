"use client";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from '@/lib/api';

export function SettingsSection() {
  const [prompt, setPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch the current prompt when component mounts
    fetchCurrentPrompt();
  }, []);

  const fetchCurrentPrompt = async () => {
    try {
      const response = await api.get('/prompts/current');
      setPrompt(response.data.content || '');
      setError('');
    } catch (err) {
      console.error('Error fetching prompt:', err);
      setError('Failed to load current prompt');
    }
  };

  const handleSavePrompt = async () => {
    setIsSaving(true);
    try {
      await api.post('/prompts', { content: prompt });
      setIsEditing(false);
      setError('');
    } catch (err) {
      console.error('Error saving prompt:', err);
      setError('Failed to save prompt');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">LLM Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              System Prompt
            </label>
            {isEditing ? (
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="w-full"
                placeholder="Enter the system prompt for the LLM..."
              />
            ) : (
              <div className="bg-gray-50 p-2 rounded text-sm max-h-32 overflow-y-auto">
                {prompt || "No prompt set"}
              </div>
            )}
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <div className="flex justify-end space-x-2">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    fetchCurrentPrompt(); // Reset to original
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSavePrompt}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Edit Prompt
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 