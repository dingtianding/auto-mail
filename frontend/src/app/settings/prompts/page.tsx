'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Prompt {
  id: number;
  name: string;
  category: string;
  content: string;
  active: boolean;
  description: string;
  version: number;
  created_at: string;
}

export default function PromptsPage() {
  // ... existing code from previous prompts/page.tsx ...
} 