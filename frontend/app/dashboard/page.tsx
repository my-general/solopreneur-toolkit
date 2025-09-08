'use client';

import { useEffect, useState } from 'react';
import axios, { isAxiosError } from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import AddProductModal from '@/components/AddProductModal';
import EditPageModal from '@/components/EditPageModal';
import EditProductModal from '@/components/EditProductModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import CreateFirstPage from '@/components/CreateFirstPage';

// Types are the same
interface Product { id: number; name: string; price: number; description: string | null; }
interface PageData { title: string; description: string | null; products: Product[]; }
interface OrderItem { product_name: string; quantity: number; price_per_item: number; }
interface Order { id: number; customer_name: string; customer_phone: string; total_price: number; created_at: string; items: OrderItem[];}

export default function DashboardPage() {
  const { token, logout, isLoading } = useAuth();
  const router = useRouter(); // router is used in useEffect
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState(''); // error is used
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Modal states are the same
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isEditPageModalOpen, setIsEditPageModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [pageRes, ordersRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/pages/me', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/orders/my-orders', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setPageData(pageRes.data);
        setOrders(ordersRes.data);
      } catch (err) {
        // Correctly type the error
        if (isAxiosError(err) && err.response?.status !== 404) {
          setError('Failed to fetch dashboard data.');
        }
        // If it is 404, we don't set an error, we show the create page component
      } finally {
        setIsInitialLoad(false);
      }
    };
    fetchData();
  }, [token, isLoading, router]); // Added router to dependency array

  // All handlers are the same
  const handlePageCreated = (newPageData: PageData) => setPageData(newPageData);
  const handlePageUpdated = (updatedPageData: { title: string; description: string | null; }) => { setPageData((prev) => prev && { ...prev, ...updatedPageData }); };
  const handleProductAdded = (newProduct: Product) => { setPageData((prev) => prev && { ...prev, products: [...prev.products, newProduct] }); };
  const handleProductUpdated = (updatedProduct: Product) => { setPageData((prev) => { if (!prev) return null; const updatedProducts = prev.products.map(p => p.id === updatedProduct.id ? updatedProduct : p); return { ...prev, products: updatedProducts }; }); };
  const handleProductDeleted = (deletedProduct: Product) => { setPageData((prev) => { if (!prev) return null; const filteredProducts = prev.products.filter(p => p.id !== deletedProduct.id); return { ...prev, products: filteredProducts }; }); };
  const openEditModal = (product: Product) => { setProductToEdit(product); setIsEditProductModalOpen(true); };
  const openDeleteModal = (product: Product) => { setProductToDelete(product); setIsDeleteModalOpen(true); };
  const confirmDelete = async () => { if (!productToDelete) return; try { await axios.delete(`http://127.0.0.1:8000/products/${productToDelete.id}`, { headers: { Authorization: `Bearer ${token}` } }); handleProductDeleted(productToDelete); setIsDeleteModalOpen(false); setProductToDelete(null); } catch (err) { console.error("Failed to delete product", err); } };
  
  if (isInitialLoad) return <div className="flex min-h-screen items-center justify-center"><p>Loading Dashboard...</p></div>;
  if (!pageData) return <CreateFirstPage onPageCreated={handlePageCreated} />;

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <nav>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="flex h-16 justify-between"><div className="flex items-center"><h1 className="text-2xl font-bold text-indigo-600">Dashboard</h1></div><div className="flex items-center"><button onClick={logout} className="rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600">Log Out</button></div></div></div>
        </nav>
        <main className="p-8">
          <div className="mx-auto max-w-3xl space-y-8">
            {error && <div className="rounded-md bg-red-100 p-4 text-red-800">{error}</div>}
            {pageData && (
              <>
                <div className="mb-8 rounded-lg bg-white p-6 shadow-lg">
                  <div className="flex items-center justify-between"><h2 className="text-3xl font-bold text-gray-800">{pageData.title}</h2><button onClick={() => setIsEditPageModalOpen(true)} className="rounded-md bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600">Edit Page</button></div>
                  <p className="mt-2 text-gray-600">{pageData.description || 'No description provided.'}</p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-lg">
                  <div className="flex items-center justify-between"><h3 className="text-2xl font-bold text-gray-800">Your Products/Services</h3><button onClick={() => setIsAddProductModalOpen(true)} className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600">Add New</button></div>
                  <ul className="mt-4 space-y-3">
                    {pageData.products.length > 0 ? (pageData.products.map((product) => (<li key={product.id} className="flex items-center justify-between rounded-md border p-3"><div><p className="font-semibold">{product.name}</p><p className="text-sm text-gray-500">₹{product.price.toFixed(2)}</p></div><div className="space-x-2"><button onClick={() => openEditModal(product)} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Edit</button><button onClick={() => openDeleteModal(product)} className="text-sm font-medium text-red-600 hover:text-red-800">Delete</button></div></li>))) 
                    : (<p className="text-center text-gray-500">You haven&apos;t added any products yet.</p>)} {/* Fixed apostrophe */}
                  </ul>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-800">Received Orders</h3>
                  <div className="mt-4 space-y-4">
                    {orders.length > 0 ? (orders.map((order) => (<div key={order.id} className="rounded-md border p-4"><div className="flex flex-wrap justify-between gap-2 border-b pb-2"><div><p className="font-semibold text-gray-800">{order.customer_name}</p><p className="text-sm text-gray-500">{order.customer_phone}</p></div><div><p className="font-bold text-indigo-600">₹{order.total_price.toFixed(2)}</p><p className="text-right text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</p></div></div><ul className="mt-2 text-sm text-gray-600">{order.items.map((item, index) => (<li key={index} className="flex justify-between"><span>{item.product_name} x {item.quantity}</span><span>(₹{item.price_per_item.toFixed(2)} each)</span></li>))}</ul></div>))) 
                    : (<p className="text-center text-gray-500">No orders received yet.</p>)}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
      <AddProductModal isOpen={isAddProductModalOpen} onClose={() => setIsAddProductModalOpen(false)} onProductAdded={handleProductAdded}/>
      {pageData && <EditPageModal isOpen={isEditPageModalOpen} onClose={() => setIsEditPageModalOpen(false)} onPageUpdated={handlePageUpdated} initialData={pageData} />}
      <EditProductModal isOpen={isEditProductModalOpen} onClose={() => setIsEditProductModalOpen(false)} onProductUpdated={handleProductUpdated} product={productToEdit} />
      {productToDelete && <ConfirmDeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} itemName={productToDelete.name} />}
    </>
  );
}
