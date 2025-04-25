"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import axios from "axios";

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default function ImportCustomersPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post("/customers/import", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      router.push("/customers");
    } catch (error) {
      console.error("Error importing customers:", error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Import Customers</h1>
      </div>

      <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <input
                  type="file"
                  accept=".csv,.json,.xml"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>
              <Button type="submit" disabled={!file}>
                Import
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sample Formats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold mb-2">CSV Format:</h4>
              <pre className="bg-gray-100 p-4 rounded-md text-sm">
                name,email,address,phone{"\n"}
                John Doe,john@example.com,123 Main St,555-0123{"\n"}
                Jane Smith,jane@example.com,456 Oak Ave,555-0124
              </pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">JSON Format:</h4>
              <pre className="bg-gray-100 p-4 rounded-md text-sm">
                {JSON.stringify([
                  {
                    name: "John Doe",
                    email: "john@example.com",
                    address: "123 Main St",
                    phone: "555-0123"
                  }
                ], null, 2)}
              </pre>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">XML Format:</h4>
              <pre className="bg-gray-100 p-4 rounded-md text-sm">
                {`<customers>
  <customer>
    <name>John Doe</name>
    <email>john@example.com</email>
    <address>123 Main St</address>
    <phone>555-0123</phone>
  </customer>
</customers>`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 