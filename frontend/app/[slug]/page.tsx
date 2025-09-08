// File: frontend/app/[slug]/page.tsx (Corrected)

'use client';

import { useEffect, useState, useMemo } from 'react';
import axios from 'axios'; // REMOVED isAxiosError from here
import { useParams } from 'next/navigation';

// --- Type Definitions ---
interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
}
interface PageData {
  title: string;
  description: string | null;
  products: Product[];
}
interface CartItem extends Product {
  quantity: number;
}

export default function PublicPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [pageData, setPageData] = useState<PageData | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    if (!slug) return;
    const fetchPageData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/pages/${slug}`);
        setPageData(response.data);
      } catch (_err) {
        setError('This page could not be found.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPageData();
  }, [slug]);

  const updateCartQuantity = (product: Product, newQuantity: number) => {
    setCart((currentCart) => {
      if (newQuantity <= 0) {
        return currentCart.filter((item) => item.id !== product.id);
      }
      const existingItem = currentCart.find((item) => item.id === product.id);
      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        );
      }
      return [...currentCart, { ...product, quantity: newQuantity }];
    });
  };

  const totalPrice = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);
  
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) { setOrderError('Your cart is empty.'); return; }
    if (!customerName || !customerPhone) { setOrderError('Please enter your name and phone number.'); return; }
    
    setIsSubmitting(true);
    setOrderError('');
    
    try {
      const orderData = {
        customer_name: customerName,
        customer_phone: customerPhone,
        items: cart.map(item => ({ product_id: item.id, quantity: item.quantity })),
      };
      await axios.post(`http://127.0.0.1:8000/orders/${slug}`, orderData);
      setOrderSuccess(true);
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
    } catch (_err) {
      setOrderError('There was an error placing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><p>Loading Storefront...</p></div>;
  if (error) return <div className="flex h-screen items-center justify-center"><p className="text-red-500">{error}</p></div>;
  if (!pageData) return null;

  if (orderSuccess) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-center">
        <div className="rounded-lg bg-white p-10 shadow-xl">
           <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-3xl font-bold text-green-600">Thank You!</h2>
          <p className="mt-2 text-lg text-gray-700">Your order has been placed successfully.</p>
          <button onClick={() => setOrderSuccess(false)} className="mt-8 rounded-md bg-indigo-600 px-6 py-2 text-white shadow transition hover:bg-indigo-700">
            Place Another Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 font-sans">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">{pageData.title}</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">{pageData.description || 'Welcome to my page!'}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-8 lg:gap-12">
          
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Products & Services</h2>
            <div className="space-y-4">
              {pageData.products.length > 0 ? (
                pageData.products.map((product) => {
                  const cartItem = cart.find(item => item.id === product.id);
                  return (
                    <div key={product.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg bg-white p-4 shadow-sm transition hover:shadow-md">
                      <div className="mb-4 sm:mb-0">
                        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">{product.description}</p>
                        <p className="mt-2 text-lg font-medium text-indigo-600">₹{product.price.toFixed(2)}</p>
                      </div>
                      <div className="flex w-full sm:w-auto items-center justify-end">
                        {!cartItem ? (
                          <button onClick={() => updateCartQuantity(product, 1)} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
                            Add to Cart
                          </button>
                        ) : (
                          <div className="flex items-center space-x-3 rounded-full bg-slate-100 p-1">
                            <button onClick={() => updateCartQuantity(product, cartItem.quantity - 1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg text-indigo-600 shadow hover:bg-slate-50">-</button>
                            <span className="w-8 text-center font-semibold">{cartItem.quantity}</span>
                            <button onClick={() => updateCartQuantity(product, cartItem.quantity + 1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg text-indigo-600 shadow hover:bg-slate-50">+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-lg bg-white p-6 text-center text-gray-500 shadow-sm">No products have been added yet.</div>
              )}
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="md:sticky md:top-8">
              <form onSubmit={handleSubmitOrder} className="mt-10 md:mt-0 rounded-lg bg-white p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800">Your Order</h2>
                {cart.length > 0 ? (
                  <>
                    <ul className="my-4 space-y-2">
                      {cart.map(item => (
                        <li key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.name} x {item.quantity}</span>
                          <span className="font-medium text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between border-t border-gray-200 pt-4 text-lg font-bold">
                      <span>Total</span>
                      <span>₹{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="mt-6 space-y-4">
                      <div>
                        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Your Name</label>
                        <input type="text" id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input type="tel" id="customerPhone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                      </div>
                    </div>
                    {orderError && <p className="mt-4 text-center text-sm text-red-600">{orderError}</p>}
                    <button type="submit" disabled={isSubmitting} className="mt-6 w-full rounded-md bg-indigo-600 px-4 py-2 text-white shadow-lg transition-colors hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                      {isSubmitting ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </>
                ) : (
                  <p className="mt-4 text-center text-gray-500">Your cart is empty. Add some products to get started!</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
