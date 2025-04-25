"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { ChevronDown, ChevronUp, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import api from '@/lib/api';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard');
        if (response.data.success) {
          setStats(response.data.data);
        } else {
          setError(response.data.error || 'Failed to load dashboard data');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="h-6 w-48 bg-gray-200 animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full bg-gray-200 animate-pulse rounded"></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="h-6 w-48 bg-gray-200 animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full bg-gray-200 animate-pulse rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* AI Business Summary - Now at the top */}
      {stats.businessSummary && (
        <div className="grid grid-cols-1 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Summary</CardTitle>
              <CardDescription>AI-powered analysis of your business performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Summary */}
                {stats.businessSummary.summary && (
                  <div>
                    <h4 className="font-medium mb-2 text-gray-700">Summary</h4>
                    <p className="text-gray-600">{stats.businessSummary.summary}</p>
                  </div>
                )}
                
                {/* Trends */}
                {stats.businessSummary.trends && stats.businessSummary.trends.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 text-gray-700">Key Trends</h4>
                    <div className="space-y-3">
                      {stats.businessSummary.trends.map((trend: any, index: number) => (
                        <div key={index} className="flex items-start bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                          <div className="p-1 rounded-full mr-2 mt-1 bg-blue-100">
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-800">{trend.title}</h5>
                            <p className="text-sm text-gray-600">{trend.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Action Items / To-Dos */}
                {stats.businessSummary.todos && stats.businessSummary.todos.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 text-gray-700">Action Items</h4>
                    <div className="space-y-3">
                      {stats.businessSummary.todos.map((todo: any, index: number) => (
                        <div key={index} className="flex items-start bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                          <div className={`p-1 rounded-full mr-2 mt-1 ${
                            todo.priority === 'high' ? 'bg-red-100' : 
                            todo.priority === 'medium' ? 'bg-yellow-100' : 
                            'bg-green-100'
                          }`}>
                            <AlertCircle className={`h-4 w-4 ${
                              todo.priority === 'high' ? 'text-red-500' : 
                              todo.priority === 'medium' ? 'text-yellow-500' : 
                              'text-green-500'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium text-gray-800">{todo.title}</h5>
                                <p className="text-sm text-gray-600">{todo.description}</p>
                              </div>
                              {todo.action && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => router.push(todo.action.link)}
                                >
                                  {todo.action.text}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Detailed Analysis (Expandable) - Raw LLM output - Moved to bottom */}
                {stats.businessSummary.detailedAnalysis && (
                  <div className="border rounded-md p-4 bg-gray-50 mt-6">
                    <div 
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setExpandedSection(expandedSection === 0 ? null : 0)}
                    >
                      <h4 className="font-medium text-gray-700">Raw LLM Output</h4>
                      {expandedSection === 0 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                    
                    {expandedSection === 0 && (
                      <div className="mt-3 space-y-3">
                        {stats.businessSummary.detailedAnalysis.fullText && (
                          <p className="text-gray-600 whitespace-pre-line">
                            {stats.businessSummary.detailedAnalysis.fullText}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${typeof stats.totalRevenue === 'number' 
                ? stats.totalRevenue.toFixed(2) 
                : parseFloat(stats.totalRevenue || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Revenue trends over the past 6 months (including pending invoices)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => {
                      return [`$${value}`, name === 'paid' ? 'Paid Revenue' : name === 'pending' ? 'Pending Revenue' : 'Total Revenue'];
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="paid" name="Paid Revenue" stackId="a" fill="#8884d8" />
                  <Bar dataKey="pending" name="Pending Revenue" stackId="a" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status</CardTitle>
            <CardDescription>Distribution of invoice statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.invoiceStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.invoiceStatus.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Customers</CardTitle>
            <CardDescription>Latest customers added to your account</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentCustomers.length > 0 ? (
              <div className="space-y-4">
                {stats.recentCustomers.map((customer: any) => (
                  <div key={customer.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => router.push(`/customers/${customer.id}`)}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No customers yet</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Latest invoices created in your account</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentInvoices.length > 0 ? (
              <div className="space-y-4">
                {stats.recentInvoices.map((invoice: any) => (
                  <div key={invoice.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium">Invoice #{invoice.invoice_number || invoice.id}</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-500">
                          ${typeof invoice.total_amount === 'number' 
                            ? invoice.total_amount.toFixed(2) 
                            : parseFloat(invoice.total_amount || 0).toFixed(2)}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => router.push(`/invoices/${invoice.id}`)}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No invoices yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}