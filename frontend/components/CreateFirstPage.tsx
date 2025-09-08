// File: frontend/components/CreateFirstPage.tsx

'use client';

import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

// Define the shape of the props this component expects
interface CreateFirstPageProps {
  onPageCreated: (newPageData: any) => void;
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.post(
        `${apiUrl}/pages/`,
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Pass the newly created page data back up to the dashboard
      onPageCreated(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create page.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8 text-center shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800">Welcome to Your Toolkit!</h2>
        <p className="mt-2 text-gray-600">
          Let's get started by creating your main page. This is what your customers will see.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 text-left">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Your Page Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., The Jubilee Hills Baker, Yoga with Anjali"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Short Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., Freshly baked goods delivered to your door."
              />
            </div>
          </div>
          {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
          <div className="mt-6">
            <button
              type="submit"
              className="w-full rounded-md bg-indigo-600 px-4 py-3 text-white shadow-lg transition-colors hover:bg-indigo-700"
            >
              Create My Page
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}