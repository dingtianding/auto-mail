// frontend/components/InvoiceAnalyzer.jsx
"use client"

import React, { useState } from 'react';

const InvoiceAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview for image files
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      } else if (selectedFile.type === 'application/pdf') {
        setPreview('/pdf-icon.png'); // You'll need to add this image
      }
    }
  };

  const analyzeInvoice = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('invoice', file);
    
    try {
      // For demo purposes, we'll just call the mock endpoint
      const response = await fetch('/api/invoices/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze invoice');
      }
      
      const data = await response.json();
      setResults(data.data);
    } catch (err) {
      console.error('Error analyzing invoice:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">AI Invoice Analysis</h2>
      
      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Upload Invoice</label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <p className="text-sm text-gray-500">Drag and drop or click to upload</p>
              <p className="text-xs text-gray-500">PDF or Image files only</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf,image/*" 
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>
      
      {preview && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Preview</h3>
          <div className="border rounded-lg p-2 flex justify-center">
            {preview.startsWith('data:image') ? (
              <img src={preview} alt="Invoice preview" className="max-h-64" />
            ) : (
              <div className="flex items-center">
                <img src={preview} alt="PDF icon" className="h-16 w-16" />
                <span className="ml-2">{file.name}</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      <button
        onClick={analyzeInvoice}
        disabled={!file || loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Analyzing...' : 'Analyze Invoice'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {results && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium text-gray-700">Invoice Number</h4>
              <p className="text-lg">{results.invoice_number}</p>
              <div className="mt-1 h-1 bg-gray-200 rounded-full">
                <div 
                  className="h-1 bg-green-500 rounded-full" 
                  style={{ width: `${results.confidence_score * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">{Math.round(results.confidence_score * 100)}% confidence</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700">Vendor</h4>
              <p className="text-lg">{results.vendor_name}</p>
              <div className="mt-1 h-1 bg-gray-200 rounded-full">
                <div 
                  className="h-1 bg-green-500 rounded-full" 
                  style={{ width: `${results.confidence_score * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">{Math.round(results.confidence_score * 100)}% confidence</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700">Date Issued</h4>
              <p className="text-lg">{results.date_issued}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700">Due Date</h4>
              <p className="text-lg">{results.due_date}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700">Total Amount</h4>
              <p className="text-lg font-bold">${results.total_amount.toFixed(2)}</p>
            </div>
          </div>
          
          <h4 className="font-medium text-gray-700 mt-4 mb-2">Line Items</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.line_items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.unit_price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.total.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {item.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700">
              Save Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceAnalyzer;