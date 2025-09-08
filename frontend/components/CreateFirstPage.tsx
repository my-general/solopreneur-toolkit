// File: frontend/components/CreateFirstPage.tsx (Corrected)

'use client';

import { useState } from 'react';
import axios, { isAxiosError } from 'axios';
import { useAuth } from '@/context/AuthContext';

// Define the types to satisfy TypeScript
interface Product { id: number; name: string; price: number; description: string | null; }
interface PageData { title: string; description: string | null; products: Product[]; }

// Update the props to use the specific PageData type
interface CreateFirstPageProps {
  onPageCreated: (newPageData: PageData) => void;
}

export default function CreateFirstPage({ onPageCreated }: CreateFirstPageProps) {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError('A page title is required.');
      return;
    }

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/pages/',
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onPageCreated(response.data);
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to create page.');
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8 text-center shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800">Welcome to Your Toolkit!</h2>
        <p className="mt-2 text-gray-600">
          Let&apos;s get started by creating your main page. This is what your customers will see.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 text-left">
          <div className="space-y-4">
            <div><label htmlFor="title" className="block text-sm font-medium text-gray-700">Your Page Title</label><input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" placeholder="e.g., The Jubilee Hills Baker, Yoga with Anjali" required /></div>
            <div><label htmlFor="description" className="block text-sm font-medium text-gray-700">Short Description (Optional)</label><textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" placeholder="e.g., Freshly baked goods delivered to your door." /></div>
          </div>
          {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
          <div className="mt-6"><button type="submit" className="w-full rounded-md bg-indigo-600 px-4 py-3 text-white shadow-lg transition-colors hover:bg-indigo-700">Create My Page</button></div>
        </form>
      </div>
    </div>
  );
}
