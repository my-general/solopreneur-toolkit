// File: frontend/components/EditProductModal.tsx

'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

// Define the shape of a product
interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
}

// Define the props for this component
interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductUpdated: (updatedProduct: Product) => void;
  product: Product | null;
}

export default function EditProductModal({ isOpen, onClose, onProductUpdated, product }: EditProductModalProps) {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  // Pre-fill form when a product is passed in
  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || '');
      setPrice(String(product.price));
    }
  }, [product, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.put(
        `${apiUrl}/products/${product.id}`,
        {
          name,
          description,
          price: parseFloat(price),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onProductUpdated(response.data);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update product.');
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        {/* ... The Transition and Dialog structure is the same as AddProductModal ... */}
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  Edit Product
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="edit-prod-name" className="block text-sm font-medium text-gray-700">Name</label>
                      <input type="text" id="edit-prod-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"/>
                    </div>
                    <div>
                      <label htmlFor="edit-prod-desc" className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea id="edit-prod-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"/>
                    </div>
                    <div>
                      <label htmlFor="edit-prod-price" className="block text-sm font-medium text-gray-700">Price (₹)</label>
                      <input type="number" id="edit-prod-price" value={price} onChange={(e) => setPrice(e.target.value)} min="0" step="0.01" className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"/>
                    </div>
                  </div>
                  {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
                  <div className="mt-6 flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">Save Changes</button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}