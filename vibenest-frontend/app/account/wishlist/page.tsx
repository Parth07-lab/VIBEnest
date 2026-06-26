'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWishlistStore } from '../../../store/useWishlistStore';
import { useCartStore } from '../../../store/useCartStore';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Product } from '../../../types/shared-types';

export default function WishlistPage() {
  const { productIds, toggleWishlist } = useWishlistStore();
  const addItem = useCartStore((state) => state.addItem);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllProducts() {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/products?limit=50');
        const result = await res.json();
        if (result.success) {
          // Filter products in local wishlist state
          const wishlistProds = result.data.filter((p: Product) => productIds.includes(p.id));
          setProducts(wishlistProds);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (productIds.length > 0) {
      fetchAllProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [productIds]);

  const handleQuickAdd = (prod: Product) => {
    if (!prod.variants || prod.variants.length === 0) return;
    const defaultVariant = prod.variants[0];
    addItem({
      productId: prod.id,
      variantId: defaultVariant.id,
      qty: 1,
      name: prod.name,
      price: prod.price,
      discountPct: prod.discountPct,
      size: defaultVariant.size,
      color: defaultVariant.color,
      imageUrl: prod.images?.[0]?.url || 'https://placehold.co/400x500',
    });
  };

  return (
    <div className="space-y-6 font-ui">
      <div>
        <h2 className="font-display text-xl font-bold uppercase tracking-wider text-white">My Wishlist</h2>
        <p className="text-brand-gray text-xs">Manage your favorite catalog styles</p>
      </div>

      {loading ? (
        <div className="text-brand-gray text-xs py-8">Fetching wishlist styles...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-brand-gray/60 space-y-4">
          <Heart size={40} className="mx-auto text-brand-gray/20" />
          <p className="text-sm">Your wishlist is empty.</p>
          <Link href="/men-clothing" className="btn-primary text-xs py-2 px-6 inline-flex">Go Catalog</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {products.map((prod) => {
            const discPrice = prod.price * (1 - prod.discountPct / 100);
            return (
              <div key={prod.id} className="border border-white/5 bg-white/[0.01] p-3 rounded space-y-3 relative group">
                <div className="aspect-[4/5] bg-brand-darkGray overflow-hidden rounded relative">
                  <img src={prod.images?.[0]?.url} alt={prod.name} className="w-full h-full object-cover" />
                  <button
                    onClick={() => toggleWishlist(prod.id)}
                    className="absolute top-2 right-2 p-1.5 bg-brand-black/80 rounded-full text-red-400 hover:text-white transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <div className="space-y-1">
                  <h4 className="text-white font-semibold truncate text-xs"><Link href={`/products/${prod.slug}`}>{prod.name}</Link></h4>
                  <div className="flex items-center gap-2 text-xs">
                    {prod.discountPct > 0 ? (
                      <>
                        <span className="text-brand-gold font-bold">₹{discPrice.toLocaleString()}</span>
                        <span className="text-brand-gray/60 line-through">₹{prod.price.toLocaleString()}</span>
                      </>
                    ) : (
                      <span className="text-white font-bold">₹{prod.price.toLocaleString()}</span>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => handleQuickAdd(prod)}
                  className="btn-primary w-full py-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                >
                  <ShoppingBag size={10} /> Add to Cart
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
