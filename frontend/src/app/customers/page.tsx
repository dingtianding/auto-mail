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
      console.log('Fetching customers...');
      
      // Use the correct endpoint directly
      const response = await api.get('/customers');
      console.log('Customer response:', response.data);
      
      // Set customers data
      const customersData = Array.isArray(response.data) ? response.data : [];
      setCustomers(customersData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Failed to load customers. Please try again later.');
      setCustomers([]); // Initialize with empty array to prevent mapping errors
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
    console.log(`Navigating to customer ${id}`);
    router.push(`/customers/${id}`);
  };

  const exportCustomers = (format = 'csv') => {
    // Create a direct download link to the customers endpoint with format
    const downloadUrl = `${api.defaults.baseURL}/customers.${format}`;
    
    // Open the URL in a new window/tab
    window.open(downloadUrl, '_blank');
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

  if (loading) {
    return <div className="p-6">Loading customers...</div>;
  }

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
            {customers && customers.length > 0 ? (
              customers.map((customer) => (
                <TableRow 
                  key={customer.id}
                  onClick={() => handleRowClick(customer.id)}
                  className="cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.documents?.length || 0}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/customers/${customer.id}`} passHref>
                      <Button
                        variant="link"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click when clicking button
                        }}
                      >
                        View
                      </Button>
                    </Link>
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 