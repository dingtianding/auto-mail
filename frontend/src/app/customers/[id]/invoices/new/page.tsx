"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from '@/lib/api';

// Client Component
function InvoiceForm({ params }: { params: { id: string } }) {
  const router = useRouter();
  // Extract the ID in the client component
  const customerId = params.id;
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  
  const [invoice, setInvoice] = useState({
    due_date: '',
    payment_terms: 'Net 30',
    tax_rate: '0.08', // Default tax rate of 8%
    notes: '',
    line_items_attributes: [
      { service: '', description: '', quantity: '1', rate: '0' }
    ]
  });

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await api.get(`/customers/${customerId}`);
        setCustomer(response.data);
      } catch (error) {
        console.error('Error fetching customer:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInvoice({ ...invoice, [name]: value });
  };

  const handleLineItemChange = (index: number, field: string, value: string) => {
    const updatedLineItems = [...invoice.line_items_attributes];
    updatedLineItems[index] = { ...updatedLineItems[index], [field]: value };
    setInvoice({ ...invoice, line_items_attributes: updatedLineItems });
  };

  const addLineItem = () => {
    setInvoice({
      ...invoice,
      line_items_attributes: [
        ...invoice.line_items_attributes,
        { service: '', description: '', quantity: '1', rate: '0' }
      ]
    });
  };

  const removeLineItem = (index: number) => {
    if (invoice.line_items_attributes.length > 1) {
      const updatedLineItems = [...invoice.line_items_attributes];
      updatedLineItems.splice(index, 1);
      setInvoice({ ...invoice, line_items_attributes: updatedLineItems });
    }
  };

  const calculateSubtotal = () => {
    return invoice.line_items_attributes.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      return sum + (quantity * rate);
    }, 0).toFixed(2);
  };

  const calculateTax = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const taxRate = parseFloat(invoice.tax_rate) || 0;
    return (subtotal * taxRate).toFixed(2);
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const tax = parseFloat(calculateTax());
    return (subtotal + tax).toFixed(2);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setAnalysisResult(null); // Clear previous results
      
      // Automatically analyze the document when it's uploaded
      await analyzeDocument(selectedFile);
    }
  };

  const analyzeDocument = async (fileToAnalyze: File = file!) => {
    if (!fileToAnalyze) return;
    
    setAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('document', fileToAnalyze);
      formData.append('prompt', 'Analyze the document. Extract invoice data including line items, due date, payment terms, tax rate, and create a professional summary note for the invoice.');
      
      // Use the correct API endpoint
      const response = await api.post('ai/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Check if there's an error in the response
      if (response.data.error) {
        throw new Error(`${response.data.error}: ${response.data.reason || 'No additional details available'}`);
      }
      
      // Update invoice with AI extracted data
      setAnalysisResult("Document analyzed successfully!");
      
      if (response.data.line_items) {
        setInvoice(prev => ({
          ...prev,
          line_items_attributes: response.data.line_items.map((item: any) => ({
            service: item.service || '',
            description: item.description || '',
            quantity: item.quantity?.toString() || '1',
            rate: item.rate?.toString() || '0'
          }))
        }));
      }
      
      if (response.data.due_date) {
        setInvoice(prev => ({
          ...prev,
          due_date: response.data.due_date
        }));
      }
      
      if (response.data.payment_terms) {
        setInvoice(prev => ({
          ...prev,
          payment_terms: response.data.payment_terms
        }));
      }
      
      if (response.data.tax_rate) {
        setInvoice(prev => ({
          ...prev,
          tax_rate: response.data.tax_rate.toString()
        }));
      }
      
      if (response.data.notes) {
        // Format the notes nicely
        const formattedNotes = response.data.notes
          .replace(/\n\n/g, '\n') // Remove double line breaks
          .trim();
          
        setInvoice(prev => ({
          ...prev,
          notes: formattedNotes
        }));
      }
    } catch (error: any) {
      console.error('Error analyzing document:', error);
      setAnalysisResult(`Failed to analyze document: ${error.message || 'Unknown error'}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post(`/customers/${customerId}/invoices`, { invoice });
      router.push(`/customers/${customerId}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading customer information...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">New Invoice for {customer?.name}</h2>

      {/* Document Analysis Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <h3 className="text-lg font-semibold mb-4">AI Document Analysis</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload a document (quote, proposal, etc.) to automatically extract invoice details.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-grow">
            <Label htmlFor="document-upload">Upload Document</Label>
            <Input
              id="document-upload"
              type="file"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="cursor-pointer"
              disabled={analyzing}
            />
          </div>
          {analyzing && (
            <div className="text-blue-600 flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing document...
            </div>
          )}
        </div>
        
        {analysisResult && (
          <div className={`p-3 mt-4 rounded-md ${analysisResult.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {analysisResult}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                name="due_date"
                type="date"
                value={invoice.due_date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <select
                id="payment_terms"
                name="payment_terms"
                value={invoice.payment_terms}
                onChange={handleInputChange}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Net 30">Net 30</option>
                <option value="Net 15">Net 15</option>
                <option value="Due on Receipt">Due on Receipt</option>
              </select>
            </div>
            <div>
              <Label htmlFor="tax_rate">Tax Rate</Label>
              <Input
                id="tax_rate"
                name="tax_rate"
                type="number"
                min="0"
                step="0.01"
                value={invoice.tax_rate}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <h4 className="text-xl font-semibold mb-4">Line Items</h4>
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="mb-4">
            {invoice.line_items_attributes.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 mb-3 items-end">
                <div className="col-span-3">
                  <Label htmlFor={`service-${index}`} className="text-sm">Service</Label>
                  <Input
                    id={`service-${index}`}
                    value={item.service}
                    onChange={(e) => handleLineItemChange(index, 'service', e.target.value)}
                    placeholder="Service"
                    required
                  />
                </div>
                <div className="col-span-4">
                  <Label htmlFor={`description-${index}`} className="text-sm">Description</Label>
                  <Input
                    id={`description-${index}`}
                    value={item.description}
                    onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                    placeholder="Description"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor={`quantity-${index}`} className="text-sm">Quantity</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                    placeholder="Qty"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor={`rate-${index}`} className="text-sm">Rate</Label>
                  <Input
                    id={`rate-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => handleLineItemChange(index, 'rate', e.target.value)}
                    placeholder="Rate"
                    required
                  />
                </div>
                <div className="col-span-1">
                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    disabled={invoice.line_items_attributes.length <= 1}
                    className="bg-red-500 text-white p-2 rounded-md w-full h-10 disabled:opacity-50"
                    aria-label="Remove line item"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={addLineItem}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md"
          >
            + Add Line Item
          </button>
          
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between py-1">
              <span>Subtotal:</span>
              <span>${calculateSubtotal()}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Tax ({(parseFloat(invoice.tax_rate) * 100).toFixed(1)}%):</span>
              <span>${calculateTax()}</span>
            </div>
            <div className="flex justify-between py-1 font-bold">
              <span>Total:</span>
              <span>${calculateTotal()}</span>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={invoice.notes}
            onChange={handleInputChange}
            placeholder="Additional notes for the customer..."
            rows={3}
          />
        </div>

        <div className="flex space-x-4">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Generating Invoice...' : 'Generate Invoice'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push(`/customers/${customerId}`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

// Server Component
export default function NewInvoicePage({ params }: { params: { id: string } }) {
  // Pass the entire params object to avoid direct access
  return <InvoiceForm params={params} />;
} 