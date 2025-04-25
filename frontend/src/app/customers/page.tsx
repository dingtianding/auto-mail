"use client";
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { CustomerForm } from '@/components/customers/customer-form';
import { MoreHorizontal, Trash, Download } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Customer {
  id: number;
  name: string;
  email: string;
  address: string;
  phone: string;
  created_at: string;
  documents: any[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Failed to load customers');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    // Stop propagation to prevent row click navigation
    e.stopPropagation();
    
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/customers/${id}`);
        fetchCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const handleRowClick = (id: number) => {
    router.push(`/customers/${id}`);
  };

  const handleExport = async (format: 'csv' | 'json' | 'xml') => {
    try {
      const response = await api.get(`/customers.${format}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' :
              format === 'json' ? 'application/json' : 'application/xml'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `customers.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error exporting ${format}:`, error);
    }
  };

  const deleteCustomer = async (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      try {
        await api.delete(`/customers/${id}`);
        // Refresh the customer list
        fetchCustomers();
      } catch (error) {
        console.error("Error deleting customer:", error);
      }
    }
  };

  const bulkDeleteCustomers = async (ids: string[]) => {
    if (ids.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${ids.length} customers?`)) {
      try {
        await api.post('/customers/bulk_destroy', { ids });
        // Refresh the customer list
        fetchCustomers();
      } catch (error) {
        console.error("Error bulk deleting customers:", error);
      }
    }
  };

  const exportCustomers = (format = 'csv') => {
    // Create a direct download link to the customers endpoint with format
    const downloadUrl = `${api.defaults.baseURL.replace('/api', '')}/customers.${format}`;
    
    // Open the URL in a new window/tab
    window.open(downloadUrl, '_blank');
  };

  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <div className="space-x-2">
          <Button 
            onClick={() => router.push('/customers/new')}
            className="bg-blue-500 hover:bg-blue-600"
          >
            New Customer
          </Button>
          <Button 
            onClick={() => router.push('/imports/new')}
            variant="outline"
          >
            Import Customers
          </Button>
        </div>
      </div>

      <div className="export-buttons mb-4">
        Export as:
        <Button 
          variant="outline" 
          onClick={() => exportCustomers('csv')}
          className="ml-2"
        >
          <Download className="h-4 w-4 mr-2" />
          CSV
        </Button>
        <Button 
          variant="outline" 
          onClick={() => exportCustomers('json')}
          className="ml-2"
        >
          <Download className="h-4 w-4 mr-2" />
          JSON
        </Button>
        <Button 
          variant="outline" 
          onClick={() => exportCustomers('xml')}
          className="ml-2"
        >
          <Download className="h-4 w-4 mr-2" />
          XML
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow 
                key={customer.id}
                onClick={() => handleRowClick(customer.id)}
                className="cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.documents?.length || 0}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="link"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click when clicking button
                      router.push(`/customers/${customer.id}`);
                    }}
                  >
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCustomer(customer.id.toString());
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 