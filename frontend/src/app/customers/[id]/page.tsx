"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { DocumentForm } from '@/components/documents/document-form';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface Document {
  id: string;  // MongoDB uses string IDs
  content: string;
  status: string;
  created_at: string;
  pdf_url?: string;
  status_color?: string;
  status_label?: string;
  processing_time?: number;
}

interface Invoice {
  id: number;
  invoice_number: string;
  created_at: string;
  due_date: string;
  total_amount: number;
  status: string;
  tax_rate?: number;
  tax_amount?: number;
  subtotal?: number;
  notes?: string;
  line_items?: Array<{
    service: string;
    description: string;
    quantity: number;
    rate: number;
    total: number;
  }>;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  address: string;
  phone: string;
  documents: Document[];
  invoices: Invoice[];
}

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePdf = async (documentId: string) => {
    try {
      await api.post(`/customers/${params.id}/documents/${documentId}/generate_pdf`);
      fetchCustomer(); // Refresh to get updated PDF URL
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleViewPdf = async (documentId: string) => {
    try {
      console.log('Viewing PDF for document ID:', documentId);
      
      if (!documentId) {
        console.error('Document ID is undefined or null');
        return;
      }
      
      const response = await api.get(`/customers/${params.id}/mailing_documents/${documentId}/download`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        },
        params: {
          disposition: 'inline'
        }
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error viewing PDF:', error);
    }
  };

  const handleRegeneratePdf = async (documentId: string) => {
    try {
      await api.post(`/customers/${params.id}/mailing_documents/${documentId}/regenerate`);
      fetchCustomer(); // Refresh to get updated PDF status
    } catch (error) {
      console.error('Error regenerating PDF:', error);
    }
  };

  const fetchCustomer = async () => {
    try {
      console.log('Fetching customer with ID:', params.id);
      const response = await api.get(`/customers/${params.id}`);
      
      // Log the entire response to see its structure
      console.log('Full API Response:', response);
      console.log('Customer Data Structure:', JSON.stringify(response.data, null, 2));
      
      // Check specifically for documents and invoices
      console.log('Documents:', response.data.documents);
      console.log('Invoices:', response.data.invoices);
      console.log('Mailing Documents:', response.data.mailing_documents);
      
      // Create a properly structured customer object
      const customerData = {
        ...response.data,
        // Use mailing_documents as documents for the frontend
        documents: response.data.mailing_documents || [],
        invoices: response.data.invoices || []
      };
      
      // Log the document structure to see what fields are available
      if (customerData.documents && customerData.documents.length > 0) {
        console.log('First document structure:', JSON.stringify(customerData.documents[0], null, 2));
      }
      
      // Set the customer with the properly structured data
      setCustomer(customerData);
      setLoading(false);
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError('Customer not found');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchCustomer();
    }
  }, [params.id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return (
    <div className="p-6">
      <div className="text-red-500">{error}</div>
      <button 
        onClick={() => router.push('/customers')}
        className="mt-4 text-blue-500 hover:underline"
      >
        Back to Customers
      </button>
    </div>
  );
  if (!customer) return <div className="p-6">Customer not found</div>;

  return (
    <div className="container mt-4">
      <Card>
        <div className="card-header">
          <h2 className="text-2xl font-bold">Customer Details</h2>
        </div>
        <div className="card-body p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Name:</strong> {customer?.name}</p>
              <p><strong>Email:</strong> {customer?.email}</p>
              <p><strong>Address:</strong> {customer?.address}</p>
              <p><strong>Phone:</strong> {customer?.phone}</p>
            </div>
            <div className="text-right space-x-2">
              <Button
                onClick={() => router.push(`/customers/${customer?.id}/edit`)}
                variant="outline"
              >
                Edit
              </Button>
              <Button
                onClick={() => router.push('/customers')}
                variant="outline"
              >
                Back
              </Button>
              <Button
                onClick={() => router.push(`/customers/${customer?.id}/documents/new`)}
                variant="default"
              >
                New Document
              </Button>
              <Button
                onClick={() => router.push(`/customers/${customer?.id}/invoices/new`)}
                variant="default"
              >
                New Invoice
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="card-header">
          <h3 className="text-xl font-bold">Documents</h3>
        </div>
        <div className="card-body p-6">
          {customer?.documents && customer.documents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Link 
                      href={`/customers/${params.id}/documents`} 
                      className="hover:text-blue-600 hover:underline"
                    >
                      Documents
                    </Link>
                  </TableHead>
                  <TableHead>Document ID</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Content Preview</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.documents.map((doc) => (
                  <TableRow key={doc._id || doc.id}>
                    <TableCell>{doc._id || doc.id}</TableCell>
                    <TableCell>
                      {new Date(doc.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-900">
                        {doc.content?.toString().slice(0, 50)}...
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`badge bg-${doc.status_color}`}>
                        {doc.status_label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          // Try both _id and id since MongoDB often uses _id
                          const documentId = doc._id || doc.id;
                          console.log('Document ID for PDF view:', documentId);
                          handleViewPdf(documentId);
                        }}
                      >
                        View PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-900">No documents yet.</p>
          )}
        </div>
      </Card>

      <Card className="mt-4">
        <div className="card-header">
          <h3 className="text-xl font-bold">Recent Invoices</h3>
        </div>
        <div className="card-body p-6">
          {customer?.invoices && customer.invoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Link 
                      href={`/customers/${params.id}/invoices`}
                      className="hover:text-blue-600 hover:underline"
                    >
                      Invoices
                    </Link>
                  </TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.invoice_number}</TableCell>
                    <TableCell>
                      {new Date(invoice.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.due_date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      }).format(invoice.total_amount)}
                    </TableCell>
                    <TableCell>
                      <span className={`badge bg-${invoice.status === 'paid' ? 'success' : 'warning'}`}>
                        {invoice.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => window.open(`/customers/${customer.id}/invoices/${invoice.id}.pdf`)}
                      >
                        <i className="fas fa-file-pdf mr-2" /> View PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-900">No invoices yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
} 