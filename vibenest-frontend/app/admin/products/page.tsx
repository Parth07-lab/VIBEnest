'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { Package, Plus, Trash2, Search, X, Edit2 } from 'lucide-react';
import { Product, Category } from '../../../types/shared-types';

export default function AdminProductsPage() {
  const { adminToken } = useAuthStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add Product Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('');
  const [price, setPrice] = useState('');
  const [discountPct, setDiscountPct] = useState('0');
  const [stock, setStock] = useState('50');
  const [categoryId, setCategoryId] = useState('');
  const [image1, setImage1] = useState('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=600');

  // Error & Success
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/products?limit=100');
      const result = await res.json();
      if (result.success) {
        setProducts(result.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/v1/products/categories');
        const result = await res.json();
        if (result.success) {
          setCategories(result.data);
          if (result.data.length > 0) setCategoryId(result.data[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (adminToken) {
      fetchProducts();
      fetchCategories();
    }
  }, [adminToken]);

  // Autofill slug from name
  useEffect(() => {
    setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  }, [name]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || !price || !categoryId) {
      setError('Please fill in required fields.');
      return;
    }

    setError('');
    setSuccess('');

    // Pre-populate standard variants
    const mockVariants = [
      { size: 'M', color: 'Matte Black', stock: 15 },
      { size: 'L', color: 'Matte Black', stock: 15 }
    ];

    const payload = {
      name,
      slug,
      sku,
      description,
      material,
      price: parseFloat(price),
      discountPct: parseFloat(discountPct),
      stock: parseInt(stock),
      categoryId,
      images: [{ url: image1 }],
      variants: mockVariants
    };

    try {
      const res = await fetch('/api/v1/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (result.success) {
        setSuccess('Product successfully cataloged!');
        setShowAddForm(false);
        fetchProducts(); // refresh products list
        
        // Reset form
        setName('');
        setSku('');
        setDescription('');
        setMaterial('');
        setPrice('');
        setDiscountPct('0');
        setStock('50');
      } else {
        setError(result.message || 'Failed to save product.');
      }
    } catch (err) {
      setError('Connection to admin API failed.');
    }
  };

  const handleDeleteProduct = async (prodId: string) => {
    if (!confirm('Are you sure you want to soft delete this product?')) return;
    try {
      const res = await fetch(`/api/v1/admin/products/${prodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const result = await res.json();
      if (result.success) {
        fetchProducts();
      } else {
        alert(result.message || 'Delete operation failed.');
      }
    } catch (err) {
      alert('Connection error.');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-ui text-sm">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wider text-white">Product Inventory</h1>
          <p className="text-brand-gray text-xs">Configure stock variants, pricing models, and catalog tags</p>
        </div>
        {!showAddForm && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="btn-primary py-2 px-6 text-xs font-bold flex items-center gap-1"
          >
            <Plus size={14} /> Add Product
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateProduct} className="bg-brand-darkGray/25 border border-white/5 p-6 rounded-lg space-y-4 max-w-2xl animate-fade-in">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="font-semibold text-white">Create New Catalog Product</h3>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-brand-gray/60 hover:text-white">
              <X size={16} />
            </button>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-white/70">Product Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Oversized Streetwear Tee" className="input-field py-1.5" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-white/70">URL Slug (Auto)</label>
              <input type="text" value={slug} className="input-field py-1.5 bg-brand-darkGray/60 cursor-not-allowed" disabled />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-white/70">Unique SKU *</label>
              <input type="text" value={sku} onChange={e => setSku(e.target.value)} placeholder="VN-M-101" className="input-field py-1.5" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-white/70">Category *</label>
              <select 
                value={categoryId} 
                onChange={e => setCategoryId(e.target.value)}
                className="input-field py-1.5"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id} className="bg-brand-darkGray">{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-white/70">Price (INR) *</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="₹2,499" className="input-field py-1.5" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-white/70">Discount Percentage</label>
              <input type="number" value={discountPct} onChange={e => setDiscountPct(e.target.value)} placeholder="15" className="input-field py-1.5" />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-white/70">Stock Quantity</label>
              <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="input-field py-1.5" />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-white/70">Material Spec</label>
              <input type="text" value={material} onChange={e => setMaterial(e.target.value)} placeholder="100% Organic Cotton" className="input-field py-1.5" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs uppercase font-bold text-white/70">Image URL</label>
              <input type="text" value={image1} onChange={e => setImage1(e.target.value)} className="input-field py-1.5" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs uppercase font-bold text-white/70">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe product fit, tailoring detail..." className="input-field py-1.5 resize-none" />
            </div>
          </div>

          <div className="flex gap-4 pt-3 border-t border-white/5">
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary py-2 flex-1">Cancel</button>
            <button type="submit" className="btn-primary py-2 flex-1">Save Product</button>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <input 
          type="text" 
          placeholder="Search items by name or SKU..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-10"
        />
        <Search size={16} className="absolute left-3.5 top-3.5 text-brand-gray" />
      </div>

      {/* Products Table */}
      {loading ? (
        <p className="text-brand-gray text-xs py-10">Fetching product database...</p>
      ) : (
        <div className="bg-brand-darkGray/10 border border-white/5 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs font-ui">
            <thead>
              <tr className="border-b border-white/5 bg-brand-darkGray/15 text-brand-gray/80 pb-2 uppercase tracking-wider font-bold">
                <th className="p-4">Style</th>
                <th className="p-4">SKU</th>
                <th className="p-4 text-right">Price</th>
                <th className="p-4 text-right">Discount</th>
                <th className="p-4 text-right">Stock</th>
                <th className="p-4 text-center">Active</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.01]">
                  <td className="p-4 flex items-center gap-3">
                    <img src={p.images?.[0]?.url || 'https://placehold.co/100x120'} alt={p.name} className="w-10 h-12 object-cover rounded bg-brand-darkGray flex-shrink-0" />
                    <span className="font-semibold block max-w-xs truncate">{p.name}</span>
                  </td>
                  <td className="p-4 font-mono uppercase text-brand-gray">{p.sku}</td>
                  <td className="p-4 text-right font-semibold">₹{p.price.toLocaleString()}</td>
                  <td className="p-4 text-right text-brand-blue font-bold">{p.discountPct}% OFF</td>
                  <td className="p-4 text-right font-semibold">{p.stock} pcs</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${p.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {p.isActive ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => handleDeleteProduct(p.id)}
                      className="text-red-400 hover:text-red-300 p-1.5"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
