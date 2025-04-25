"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function AIPromptsPage() {
  // Hardcoded prompts from the backend
  const defaultPrompts = {
    invoiceAnalysis: `You are an expert document analyzer specializing in invoice extraction.
      
DOCUMENT CONTENT OR FILENAME:
{document_content}

TASK:
{prompt_text}

Extract the following information from the document:
1. Line items (service name, description, quantity, rate)
2. Due date
3. Payment terms
4. Tax rate (if available)
5. Notes or additional information

For the notes field, please create a professional, concise summary of the services being provided.

Format your response as a valid JSON object with the following structure:
{
  "line_items": [
    {
      "service": "Service name",
      "description": "Description",
      "quantity": 1,
      "rate": 100
    }
  ],
  "due_date": "YYYY-MM-DD",
  "payment_terms": "Net 30",
  "tax_rate": 0.08,
  "notes": "Professional summary note for the invoice"
}

If you cannot extract the information with confidence, respond with:
{
  "error": "Unable to extract information from this document",
  "reason": "Explain why the extraction failed"
}

IMPORTANT: Make sure your response is valid JSON. Do not include any text outside the JSON object.`,
    
    chatAssistant: `You are a helpful financial assistant for a small business accounting application.
    
You can help with:
- Explaining financial concepts
- Providing advice on invoicing and payments
- Answering questions about accounting practices
- Suggesting ways to improve cash flow
- Interpreting financial reports

Be professional, concise, and helpful. If you don't know something, say so rather than making up information.`,

    reportAnalysis: `You are an expert financial analyst specializing in small business accounting.

REPORT DATA:
{report_data}

Analyze the provided financial data and provide insights on:
1. Revenue trends
2. Expense patterns
3. Profitability
4. Cash flow
5. Areas of concern
6. Opportunities for improvement

Your analysis should be clear, concise, and actionable. Focus on the most important insights that would be valuable to a small business owner.

Format your response in clear sections with headers. Use bullet points where appropriate for readability.`,

    customerInsights: `You are a business intelligence specialist focused on customer relationship management.

CUSTOMER DATA:
{customer_data}

Analyze this customer's data and provide insights on:
1. Payment history and patterns
2. Engagement level
3. Potential upsell opportunities
4. Risk factors (if any)
5. Recommended actions

Your insights should be data-driven, professional, and actionable. Avoid making assumptions without supporting evidence.`,

    emailDraft: `You are an expert at business communication for a small accounting firm.

CONTEXT:
{context}

Draft a professional email for the following purpose:
{purpose}

The email should be:
- Professional and courteous
- Clear and concise
- Action-oriented when appropriate
- Properly formatted with greeting and signature

Adapt the tone to be appropriate for the recipient and purpose. Include a clear subject line.`
  };

  const [prompts, setPrompts] = useState(defaultPrompts);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleEdit = (promptKey: string) => {
    setEditingPrompt(promptKey);
  };

  const handleCancel = (promptKey: string) => {
    setEditingPrompt(null);
    // Reset to default
    setPrompts(prev => ({
      ...prev,
      [promptKey]: defaultPrompts[promptKey as keyof typeof defaultPrompts]
    }));
  };

  const handleSave = (promptKey: string) => {
    // Simulate saving with a timeout
    setTimeout(() => {
      setEditingPrompt(null);
      
      // Create a more descriptive success message based on the prompt type
      const promptNames: Record<string, string> = {
        invoiceAnalysis: 'Invoice Analysis',
        chatAssistant: 'Chat Assistant',
        reportAnalysis: 'Financial Report Analysis',
        customerInsights: 'Customer Insights',
        emailDraft: 'Email Draft Generator'
      };
      
      setSuccessMessage(`${promptNames[promptKey]} prompt saved successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 500);
  };

  const handleChange = (promptKey: string, value: string) => {
    setPrompts(prev => ({
      ...prev,
      [promptKey]: value
    }));
  };

  // Helper function to render a prompt section
  const renderPromptSection = (key: string, title: string, description: string) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-sm text-gray-600 mb-4">
        {description}
      </p>
      
      {editingPrompt === key ? (
        <>
          <Textarea
            value={prompts[key as keyof typeof prompts]}
            onChange={(e) => handleChange(key, e.target.value)}
            rows={key === 'invoiceAnalysis' ? 20 : 10}
            className="w-full font-mono mb-4"
          />
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => handleCancel(key)}
            >
              Cancel
            </Button>
            <Button onClick={() => handleSave(key)}>
              Save Changes
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="bg-gray-50 p-4 rounded border text-sm font-mono whitespace-pre-wrap mb-4 max-h-96 overflow-y-auto">
            {prompts[key as keyof typeof prompts]}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => handleEdit(key)}>
              Edit Prompt
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">AI Prompts</h1>
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      {renderPromptSection(
        'invoiceAnalysis', 
        'Invoice Analysis Prompt', 
        'This prompt is used for analyzing and extracting information from invoice documents.'
      )}
      
      {renderPromptSection(
        'chatAssistant', 
        'Chat Assistant Prompt', 
        'This prompt defines the behavior of the chat assistant throughout the application.'
      )}
      
      {renderPromptSection(
        'reportAnalysis', 
        'Financial Report Analysis Prompt', 
        'This prompt is used to analyze financial reports and provide business insights.'
      )}
      
      {renderPromptSection(
        'customerInsights', 
        'Customer Insights Prompt', 
        'This prompt generates insights and recommendations based on customer data.'
      )}
      
      {renderPromptSection(
        'emailDraft', 
        'Email Draft Generator Prompt', 
        'This prompt helps generate professional email drafts for various business purposes.'
      )}
    </div>
  );
} 