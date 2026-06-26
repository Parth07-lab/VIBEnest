'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, ShoppingBag, Heart, Check, RefreshCw, Truck, HelpCircle } from 'lucide-react';
import { Product, ProductVariant, ProductImage } from '../../../types/shared-types';
import { useCartStore } from '../../../store/useCartStore';
import { useWishlistStore } from '../../../store/useWishlistStore';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, hasItem } = useWishlistStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Selected options
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImage, setActiveImage] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // Success state for quick indicator
  const [addSuccess, setAddSuccess] = useState(false);

  useEffect(() => {
    async function fetchProductDetails() {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/products/${slug}`);
        const result = await res.json();
        if (result.success) {
          const prod: Product = result.data;
          setProduct(prod);
          
          if (prod.images && prod.images.length > 0) {
            setActiveImage(prod.images[0].url);
          }

          // Preset default selected color and size from first variant
          if (prod.variants && prod.variants.length > 0) {
            setSelectedColor(prod.variants[0].color);
            setSelectedSize(prod.variants[0].size);
          }

          // Fetch related products
          const relatedRes = await fetch(`/api/v1/products?limit=4`);
          const relatedResult = await relatedRes.json();
          if (relatedResult.success) {
            setRelatedProducts(relatedResult.data.filter((p: Product) => p.slug !== slug));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      fetchProductDetails();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4 text-brand-gray text-sm">
          <RefreshCw size={24} className="animate-spin text-brand-blue" />
          Loading product details...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-6">
        <h2 className="font-display text-2xl font-bold">Product Not Found</h2>
        <p className="text-brand-gray text-sm">The product catalog item you requested does not exist or has been removed.</p>
        <Link href="/men-clothing" className="btn-primary inline-flex text-xs">Return to Catalog</Link>
      </div>
    );
  }

  // Get matching variant from selected size/color
  const activeVariant = product.variants?.find(
    v => v.color === selectedColor && v.size === selectedSize
  );

  const isOutOfStock = !activeVariant || activeVariant.stock <= 0;

  // Add to Cart
  const handleAddToCart = () => {
    if (!activeVariant) return;

    addItem({
      productId: product.id,
      variantId: activeVariant.id,
      qty: quantity,
      name: product.name,
      price: product.price,
      discountPct: product.discountPct,
      size: selectedSize,
      color: selectedColor,
      imageUrl: product.images?.[0]?.url || 'https://placehold.co/400x500',
    });

    setAddSuccess(true);
    setTimeout(() => setAddSuccess(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  // Find colors and sizes available
  const availableColors = Array.from(new Set(product.variants?.map(v => v.color) || []));
  const availableSizes = Array.from(new Set(product.variants?.filter(v => v.color === selectedColor).map(v => v.size) || []));

  const discountedPrice = product.price * (1 - product.discountPct / 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* --- Breadcrumbs --- */}
      <div className="text-brand-gray text-xs font-ui uppercase tracking-wider flex items-center gap-2">
        <Link href="/" className="hover:text-white">Home</Link>
        <span>/</span>
        <Link href="/men-clothing" className="hover:text-white">Catalog</Link>
        <span>/</span>
        <span className="text-white font-semibold">{product.name}</span>
      </div>

      {/* --- PDP CORE Layout --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT COLUMN: Gallery */}
        <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">
          {/* Thumbnails list */}
          <div className="flex md:flex-col gap-2 order-2 md:order-1 overflow-x-auto md:overflow-y-auto max-h-[500px]">
            {product.images?.map((img) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(img.url)}
                className={`w-16 h-20 md:w-20 md:h-24 flex-shrink-0 border bg-brand-darkGray rounded overflow-hidden transition-colors ${
                  activeImage === img.url ? 'border-brand-blue' : 'border-white/10 hover:border-white/30'
                }`}
              >
                <img src={img.url} alt={product.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Active Image Box */}
          <div className="flex-1 order-1 md:order-2 aspect-[4/5] bg-brand-darkGray rounded overflow-hidden border border-white/5 relative">
            <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
            {product.discountPct > 0 && (
              <span className="absolute top-4 left-4 bg-brand-blue text-white text-xs font-bold px-3 py-1 rounded">
                {product.discountPct}% OFF
              </span>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Options */}
        <div className="lg:col-span-5 space-y-6 font-ui">
          <div>
            <span className="text-brand-gray text-xs tracking-wider uppercase font-semibold">{product.sku}</span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-wide text-white mt-1">{product.name}</h1>
          </div>

          {/* Price Tag */}
          <div className="flex items-baseline gap-4 py-2 border-y border-white/5">
            {product.discountPct > 0 ? (
              <>
                <span className="text-brand-gold font-bold text-3xl">₹{discountedPrice.toLocaleString()}</span>
                <span className="text-brand-gray line-through text-base">₹{product.price.toLocaleString()}</span>
              </>
            ) : (
              <span className="text-white font-bold text-3xl">₹{product.price.toLocaleString()}</span>
            )}
            <span className="text-green-400 font-semibold text-xs border border-green-500/30 px-2 py-0.5 rounded uppercase tracking-wider ml-auto">Free Shipping</span>
          </div>

          {/* Description Snippet */}
          <p className="text-white/70 font-body text-sm leading-relaxed">{product.description}</p>

          {/* Variant: Colors */}
          {availableColors.length > 0 && (
            <div className="space-y-3">
              <span className="text-white text-xs font-bold uppercase tracking-wider block">Color: <strong className="text-brand-blue">{selectedColor}</strong></span>
              <div className="flex gap-2">
                {availableColors.map((color) => {
                  // Find color hex code if available in productsData or mock
                  const matchingVariant = product.variants?.find(v => v.color === color);
                  return (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        // Reset size selection if it doesn't match available sizes for this color
                        const nextSizes = product.variants?.filter(v => v.color === color).map(v => v.size) || [];
                        if (!nextSizes.includes(selectedSize)) {
                          setSelectedSize(nextSizes[0] || '');
                        }
                      }}
                      className={`text-xs px-4 py-2 border rounded font-semibold transition-all ${
                        selectedColor === color 
                          ? 'border-brand-blue bg-brand-blue text-white' 
                          : 'border-white/15 text-white/80 hover:border-white/30 bg-transparent'
                      }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Variant: Sizes */}
          {availableSizes.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between text-xs uppercase font-bold tracking-wider text-white">
                <span>Size: <strong className="text-brand-blue">{selectedSize}</strong></span>
                <button className="text-brand-gray/60 hover:text-white underline">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => {
                  const sizeVariant = product.variants?.find(v => v.color === selectedColor && v.size === size);
                  const isSizeOutOfStock = !sizeVariant || sizeVariant.stock <= 0;
                  return (
                    <button
                      key={size}
                      disabled={isSizeOutOfStock}
                      onClick={() => setSelectedSize(size)}
                      className={`w-10 h-10 border rounded flex items-center justify-center font-bold text-xs transition-all disabled:opacity-20 ${
                        selectedSize === size
                          ? 'border-brand-blue bg-brand-blue text-white'
                          : 'border-white/15 text-white/80 hover:border-white/30 bg-transparent'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Inventory status info */}
          {activeVariant && (
            <p className="text-xs text-brand-gray flex items-center gap-1.5 pt-2">
              <span className={`w-2 h-2 rounded-full ${activeVariant.stock > 5 ? 'bg-green-400' : activeVariant.stock > 0 ? 'bg-brand-gold' : 'bg-red-400'}`} />
              {activeVariant.stock > 5 ? 'In Stock (Ready to dispatch)' : activeVariant.stock > 0 ? `Only ${activeVariant.stock} left in stock!` : 'Out of stock'}
            </p>
          )}

          {/* Actions: Qty + Add to Cart */}
          <div className="flex gap-4 pt-4 border-t border-white/5">
            <div className="flex items-center border border-white/15 rounded">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-12 text-white/60 hover:text-white flex items-center justify-center"
              >
                -
              </button>
              <span className="w-10 text-center font-bold font-ui text-sm">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-12 text-white/60 hover:text-white flex items-center justify-center"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 ${
                addSuccess 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-brand-blue hover:bg-brand-blue/90'
              } text-white font-bold uppercase tracking-wider text-xs rounded transition-all flex items-center justify-center gap-2`}
            >
              {addSuccess ? (
                <>
                  <Check size={14} /> Added to Cart
                </>
              ) : isOutOfStock ? (
                'Out of Stock'
              ) : (
                <>
                  <ShoppingBag size={14} /> Add to Cart
                </>
              )}
            </button>
            
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`p-3 border rounded transition-colors ${
                hasItem(product.id)
                  ? 'border-brand-gold bg-brand-gold/10 text-brand-gold'
                  : 'border-white/15 hover:border-white/30 text-white/80'
              }`}
            >
              <Heart size={18} fill={hasItem(product.id) ? 'currentColor' : 'none'} />
            </button>
          </div>

          <button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="btn-secondary w-full border-brand-gold text-brand-gold hover:bg-brand-gold/5 py-3 font-bold uppercase tracking-wider text-xs"
          >
            Buy It Now
          </button>

          {/* Perks panel */}
          <div className="bg-white/[0.02] border border-white/5 rounded p-4 space-y-3 mt-4 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <Truck size={14} className="text-brand-blue" />
              <span>Fast home shipping across India</span>
            </div>
            <div className="flex items-center gap-2">
              <HelpCircle size={14} className="text-brand-gold" />
              <span>Sustainably made, 30 days hassle-free return policy</span>
            </div>
          </div>
        </div>

      </div>

      {/* --- TABBED DETAILS SECTION --- */}
      <div className="border-t border-white/10 pt-12 space-y-8">
        <div className="flex border-b border-white/10 gap-8 text-sm font-ui">
          {[
            { id: 'description', name: 'Description' },
            { id: 'materials', name: 'Materials & Care' },
            { id: 'reviews', name: `Customer Reviews (${product.reviewsCount || 0})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 uppercase font-bold tracking-wider text-xs border-b-2 transition-all ${
                activeTab === tab.id 
                  ? 'border-brand-blue text-white' 
                  : 'border-transparent text-brand-gray/60 hover:text-white'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        <div className="font-body text-sm leading-relaxed text-white/80 max-w-3xl">
          {activeTab === 'description' && (
            <div className="space-y-4">
              <p>{product.description}</p>
              <p>Designed with meticulous attention to tailoring. Fabric is sourced from premium suppliers to ensure soft-touch loops and longevity.</p>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Material Specification:</h4>
              <p>{product.material || 'Organic cotton linen composite'}</p>
              <h4 className="text-white font-semibold mt-4">Care Instructions:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Machine wash cold inside out with similar colors</li>
                <li>Tumble dry low or line dry in shade</li>
                <li>Iron medium heat if necessary</li>
                <li>Do not bleach or dry clean</li>
              </ul>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev: any) => (
                  <div key={rev.id} className="border-b border-white/5 pb-4 space-y-2">
                    <div className="flex justify-between items-center text-xs font-ui">
                      <div className="flex items-center gap-2">
                        <strong className="text-white font-semibold">{rev.userName}</strong>
                        {rev.isVerified && (
                          <span className="text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded text-[10px] font-bold">Verified Buyer</span>
                        )}
                      </div>
                      <span className="text-brand-gray/60">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-brand-gold">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={11} fill={i < rev.rating ? 'currentColor' : 'none'} className="border-transparent" />
                      ))}
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">{rev.body}</p>
                  </div>
                ))
              ) : (
                <p className="text-brand-gray/50 text-xs">No reviews have been written for this product yet.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- RELATED PRODUCTS GRID --- */}
      {relatedProducts.length > 0 && (
        <section className="space-y-8 pt-10 border-t border-white/10">
          <h2 className="font-display text-2xl font-bold uppercase tracking-wider text-white">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((p) => {
              const discPrice = p.price * (1 - p.discountPct / 100);
              return (
                <Link 
                  key={p.id} 
                  href={`/products/${p.slug}`}
                  className="group space-y-2 text-xs font-ui block bg-white/[0.01] border border-white/5 p-3 rounded hover:border-white/10 transition-all"
                >
                  <div className="aspect-[4/5] bg-brand-darkGray overflow-hidden rounded">
                    <img src={p.images?.[0]?.url} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <h4 className="text-white font-semibold truncate group-hover:text-brand-blue mt-2">{p.name}</h4>
                  <div className="flex items-center gap-2">
                    {p.discountPct > 0 ? (
                      <>
                        <span className="text-brand-gold font-bold">₹{discPrice.toLocaleString()}</span>
                        <span className="text-brand-gray/60 line-through">₹{p.price.toLocaleString()}</span>
                      </>
                    ) : (
                      <span className="text-white font-bold">₹{p.price.toLocaleString()}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
