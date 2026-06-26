'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Star, ShoppingBag, ShieldCheck, Heart } from 'lucide-react';
import { Product } from '../types/shared-types';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, hasItem } = useWishlistStore();

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch('/api/v1/products/featured');
        const result = await res.json();
        if (result.success) {
          setProducts(result.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  const handleQuickAdd = (e: React.MouseEvent, prod: Product) => {
    e.preventDefault();
    if (!prod.variants || prod.variants.length === 0) return;
    
    // Choose primary/first variant
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
    <div className="space-y-20 pb-20">
      {/* --- HERO SECTION --- */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1920")',
          }}
        />
        <div className="absolute inset-0 bg-brand-black/55" />

        {/* Hero Text */}
        <div className="relative max-w-5xl mx-auto text-center px-4 space-y-6">
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-brand-gold uppercase tracking-widest font-semibold text-xs sm:text-sm"
          >
            Spring / Summer Collection
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-tight"
          >
            THE ART OF MODERN <span className="text-brand-blue">VIBING</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-body text-white/70 max-w-xl mx-auto text-sm sm:text-lg"
          >
            Discover minimalist aesthetics, premium fabrics, and tailored luxury constructed for the modern silhouette.
          </motion.p>

          {/* Action CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 pt-6"
          >
            <Link href="/men-clothing" className="btn-primary px-8 py-4 font-bold uppercase tracking-wider text-xs">
              Shop Men
            </Link>
            <Link href="/women-clothing" className="btn-secondary px-8 py-4 font-bold uppercase tracking-wider text-xs">
              Shop Women
            </Link>
            <Link href="/footwear" className="btn-secondary px-8 py-4 font-bold text-xs uppercase tracking-wider border-brand-gold text-brand-gold hover:bg-brand-gold/5">
              Explore Footwear
            </Link>
          </motion.div>
        </div>
      </section>

      {/* --- GRID CATEGORIES --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "MEN'S CLOTHING", slug: 'men-clothing', img: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=600' },
            { name: "WOMEN'S CLOTHING", slug: 'women-clothing', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600' },
            { name: 'FOOTWEAR RUNNERS', slug: 'footwear', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600' },
            { name: 'ACCESSORIES', slug: 'accessories', img: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?q=80&w=600' }
          ].map((cat, idx) => (
            <Link key={idx} href={`/${cat.slug}`} className="group relative h-96 overflow-hidden rounded border border-white/5 shadow-2xl block bg-brand-darkGray">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url("${cat.img}")` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/20 to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center text-white">
                <span className="font-display text-lg font-bold tracking-widest">{cat.name}</span>
                <span className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-brand-blue group-hover:border-brand-blue transition-colors">
                  <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* --- NEW ARRIVALS / FEATURED --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex justify-between items-end border-b border-white/5 pb-4">
          <div className="space-y-1">
            <p className="text-brand-blue font-semibold text-xs uppercase tracking-wider">Curated Styles</p>
            <h2 className="text-3xl font-bold uppercase tracking-wide">New Arrivals</h2>
          </div>
          <Link href="/men-clothing" className="text-brand-gold text-xs font-semibold hover:text-white flex items-center gap-1 transition-colors uppercase tracking-wider">
            View Catalog <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="space-y-4 animate-pulse">
                <div className="h-80 bg-brand-darkGray rounded" />
                <div className="h-4 bg-brand-darkGray rounded w-2/3" />
                <div className="h-4 bg-brand-darkGray rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.slice(0, 8).map((prod) => {
              const discountedPrice = prod.price * (1 - prod.discountPct / 100);
              const isWishlisted = hasItem(prod.id);
              return (
                <div key={prod.id} className="group relative space-y-3 bg-white/[0.02] border border-white/5 p-3 rounded hover:border-white/10 transition-colors">
                  <Link href={`/products/${prod.slug}`} className="block relative aspect-[4/5] bg-brand-darkGray overflow-hidden rounded">
                    <img 
                      src={prod.images?.[0]?.url || 'https://placehold.co/400x500'} 
                      alt={prod.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {/* Badge */}
                    {prod.discountPct > 0 && (
                      <span className="absolute top-3 left-3 bg-brand-blue text-white text-[9px] font-bold px-2 py-0.5 rounded">
                        {prod.discountPct}% OFF
                      </span>
                    )}

                    {/* Wishlist toggle */}
                    <button 
                      onClick={(e) => { e.preventDefault(); toggleWishlist(prod.id); }}
                      className={`absolute top-3 right-3 p-1.5 rounded-full border backdrop-blur-md transition-colors ${
                        isWishlisted 
                          ? 'bg-brand-gold border-brand-gold text-brand-black' 
                          : 'bg-brand-black/40 border-white/10 text-white hover:bg-brand-black'
                      }`}
                    >
                      <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
                    </button>

                    {/* Quick Add overlay */}
                    <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => handleQuickAdd(e, prod)}
                        className="btn-primary w-full py-2 text-xs font-semibold flex items-center justify-center gap-1 shadow-lg"
                      >
                        <ShoppingBag size={12} /> Quick Add
                      </button>
                    </div>
                  </Link>

                  <div>
                    <h3 className="text-white font-ui font-semibold text-sm truncate group-hover:text-brand-blue transition-colors">
                      <Link href={`/products/${prod.slug}`}>{prod.name}</Link>
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2 font-ui text-sm">
                        {prod.discountPct > 0 ? (
                          <>
                            <span className="text-brand-gold font-semibold">₹{discountedPrice.toLocaleString()}</span>
                            <span className="text-brand-gray/60 line-through text-xs">₹{prod.price.toLocaleString()}</span>
                          </>
                        ) : (
                          <span className="text-white font-semibold">₹{prod.price.toLocaleString()}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-brand-gold font-semibold">
                        <Star size={10} fill="currentColor" /> {prod.avgRating || '4.5'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* --- BRAND STORY --- */}
      <section className="bg-brand-darkGray/40 border-y border-white/5 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-brand-blue font-semibold text-xs uppercase tracking-widest">ABOUT VIBENEST</p>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              REDEFINING EVERYDAY SILHOUETTES
            </h2>
            <p className="font-body text-white/70 leading-relaxed text-sm sm:text-base">
              VibeNest was built on a single ethos: design elevated streetwear that lasts. We collaborate with eco-conscious European suppliers, choosing organic materials, dense luxury knits, and premium finishes.
            </p>
            <p className="font-body text-white/70 leading-relaxed text-sm sm:text-base">
              Our tailoring is clean, our details are subtle, and our personality is timeless. Experience the intersection of youth culture and premium luxury.
            </p>
            <div className="flex gap-8 pt-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-brand-gold" />
                <span className="text-white font-ui font-semibold text-xs uppercase">Premium Fabrics</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-brand-gold" />
                <span className="text-white font-ui font-semibold text-xs uppercase">Conscious Sourcing</span>
              </div>
            </div>
          </div>
          <div className="relative h-96 sm:h-[450px] rounded overflow-hidden shadow-2xl border border-white/5">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800")' }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
