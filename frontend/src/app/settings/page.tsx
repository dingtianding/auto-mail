"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  // Hardcoded default prompts
  const defaultChatPrompt = `You are an AI assistant for QuickPilot, a business management application.
You help users with financial data, invoices, and customer information.
When asked about customers, you can provide information about their accounts, invoices, and payment history.
When asked about invoices, you can explain line items, payment terms, and due dates.
Always be professional, clear, and concise in your responses.`;

  const defaultBusinessSummaryPrompt = `You are a business analytics expert. Analyze the following business data and provide insights:

BUSINESS DATA:
{businessData}

Based on this data, please provide:
1. A detailed analysis (3-4 paragraphs) of the business performance
2. 3-5 key findings as bullet points
3. 3-5 specific recommendations as bullet points

Format your response as a JSON object with the following structure:
{
  "detailedAnalysis": "Your detailed analysis here...",
  "keyFindings": ["Finding 1", "Finding 2", ...],
  "recommendations": ["Recommendation 1", "Recommendation 2", ...]
}

IMPORTANT: Make sure to include specific, actionable recommendations based on the data. If revenue is low or zero, suggest specific strategies to increase sales. If there are pending invoices, recommend following up on them. Be specific and practical.`;

  const [chatPrompt, setChatPrompt] = useState(defaultChatPrompt);
  const [businessPrompt, setBusinessPrompt] = useState(defaultBusinessSummaryPrompt);
  const [isEditingChat, setIsEditingChat] = useState(false);
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSave = (type) => {
    // Simulate saving with a timeout
    setTimeout(() => {
      if (type === 'chat') {
        setIsEditingChat(false);
      } else {
        setIsEditingBusiness(false);
      }
      
      setSuccessMessage(`${type === 'chat' ? 'Chat' : 'Business Summary'} prompt saved successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 500);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">QuickPilot Settings</h1>
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Chat Assistant Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            This prompt is used for the main chat assistant that helps users with questions about the application.
          </p>
          
          {isEditingChat ? (
            <>
              <Textarea
                value={chatPrompt}
                onChange={(e) => setChatPrompt(e.target.value)}
                rows={10}
                className="w-full font-mono mb-4"
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditingChat(false);
                    setChatPrompt(defaultChatPrompt);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={() => handleSave('chat')}>
                  Save
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gray-50 p-4 rounded border text-sm font-mono whitespace-pre-wrap mb-4">
                {chatPrompt}
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setIsEditingChat(true)}>
                  Edit Prompt
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Business Summary Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            This prompt is used to generate business insights and recommendations on the dashboard.
          </p>
          
          {isEditingBusiness ? (
            <>
              <Textarea
                value={businessPrompt}
                onChange={(e) => setBusinessPrompt(e.target.value)}
                rows={10}
                className="w-full font-mono mb-4"
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditingBusiness(false);
                    setBusinessPrompt(defaultBusinessSummaryPrompt);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={() => handleSave('business')}>
                  Save
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gray-50 p-4 rounded border text-sm font-mono whitespace-pre-wrap mb-4">
                {businessPrompt}
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setIsEditingBusiness(true)}>
                  Edit Prompt
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 