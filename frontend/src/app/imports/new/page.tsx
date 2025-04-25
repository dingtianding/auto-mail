"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Download, Sparkles, AlertCircle, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import api from '@/lib/api';

interface AIAnalysis {
  can_import: boolean;
  confidence_score: number;
  warnings: string[];
  suggestions: string[];
  analysis_details: string;
}

export default function ImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      await analyzeFile(selectedFile);
    }
  };

  const analyzeFile = async (file: File) => {
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post("/customers/analyze", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAnalysis(response.data.data);
    } catch (error) {
      console.error("Error analyzing file:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImport = async () => {
    if (!file || isAnalyzing) return;
    
    setIsAnalyzing(true);
    setNotification({ type: null, message: '' });
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post("/customers/import", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Show success notification
      setNotification({
        type: 'success',
        message: response.data.message || 'Import successful!'
      });
      
      // Optional: Redirect after a delay
      setTimeout(() => {
        router.push('/customers');
      }, 2000);
    } catch (error) {
      console.error("Error importing file:", error);
      
      // Show error notification
      setNotification({
        type: 'error',
        message: error.response?.data?.error || "An error occurred during import"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const downloadTemplate = (format: 'csv' | 'json' | 'xml') => {
    let content = '';
    let filename = '';
    let type = '';

    switch (format) {
      case 'csv':
        content = 'name,email,address,phone\nJohn Doe,john.doe@example.com,123 Main St,555-123-4567\nJane Smith,jane.smith@example.com,456 Oak Ave,555-987-6543';
        filename = 'customers_template.csv';
        type = 'text/csv';
        break;
      case 'json':
        content = JSON.stringify([
          {
            name: 'John Doe',
            email: 'john.doe@example.com',
            address: '123 Main St',
            phone: '555-123-4567'
          },
          {
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            address: '456 Oak Ave',
            phone: '555-987-6543'
          }
        ], null, 2);
        filename = 'customers_template.json';
        type = 'application/json';
        break;
      case 'xml':
        content = `<customers>
  <customer>
    <name>John Doe</name>
    <email>john.doe@example.com</email>
    <address>123 Main St</address>
    <phone>555-123-4567</phone>
  </customer>
  <customer>
    <name>Jane Smith</name>
    <email>jane.smith@example.com</email>
    <address>456 Oak Ave</address>
    <phone>555-987-6543</phone>
  </customer>
</customers>`;
        filename = 'customers_template.xml';
        type = 'application/xml';
        break;
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Import Customers</h1>
      </div>

      <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-blue-500" />
              AI-Powered Import
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <input
                  type="file"
                  accept=".csv,.json,.xml"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>

              {isAnalyzing && (
                <div className="text-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">AI is analyzing your file...</p>
                </div>
              )}

              {analysis && (
                <div className="space-y-4 border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Analysis Results</h3>
                    <div className="flex items-center">
                      {analysis.can_import ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 mr-2" />
                      )}
                      <span className="text-sm">
                        Confidence Score: {Math.round(analysis.confidence_score * 100)}%
                      </span>
                    </div>
                  </div>

                  {analysis.warnings.length > 0 && (
                    <div className="bg-yellow-50 p-3 rounded-md">
                      <h4 className="font-medium text-yellow-800 mb-2">Warnings:</h4>
                      <ul className="list-disc pl-5 text-sm text-yellow-700">
                        {analysis.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.suggestions.length > 0 && (
                    <div className="bg-blue-50 p-3 rounded-md">
                      <h4 className="font-medium text-blue-800 mb-2">Suggestions:</h4>
                      <ul className="list-disc pl-5 text-sm text-blue-700">
                        {analysis.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <Button 
                      variant="ghost" 
                      className="w-full flex justify-between items-center p-2 text-gray-700"
                      onClick={toggleDetails}
                    >
                      <span className="font-medium">Full Analysis Details</span>
                      {showDetails ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </Button>
                    
                    {showDetails && (
                      <div className="bg-gray-50 p-3 rounded-md mt-2">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {analysis.analysis_details}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <Button
                  onClick={handleImport}
                  disabled={!file || !analysis?.can_import || isAnalyzing}
                >
                  {analysis?.can_import ? 'Import' : 'Fix Issues to Import'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/customers')}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sample Formats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2">CSV Format:</h3>
                <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-x-auto">
                  name,email,address,phone<br />
                  John Doe,john.doe@example.com,123 Main St,555-123-4567<br />
                  Jane Smith,jane.smith@example.com,456 Oak Ave,555-987-6543
                </pre>
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadTemplate('csv')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download CSV Template
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">JSON Format:</h3>
                <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-x-auto">
                  {`[
    {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "address": "123 Main St",
      "phone": "555-123-4567"
    },
    {
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "address": "456 Oak Ave",
      "phone": "555-987-6543"
    }
  ]`}
                </pre>
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadTemplate('json')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download JSON Template
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">XML Format:</h3>
                <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-x-auto">
                  {`<customers>
  <customer>
    <name>John Doe</name>
    <email>john.doe@example.com</email>
    <address>123 Main St</address>
    <phone>555-123-4567</phone>
  </customer>
  <customer>
    <name>Jane Smith</name>
    <email>jane.smith@example.com</email>
    <address>456 Oak Ave</address>
    <phone>555-987-6543</phone>
  </customer>
</customers>`}
                </pre>
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadTemplate('xml')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download XML Template
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {notification.type && (
          <div className={`p-4 mb-4 rounded-md ${
            notification.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 