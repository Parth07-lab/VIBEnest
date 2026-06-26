'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { Star, ShoppingBag, Heart, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Product } from '../../types/shared-types';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';

export default function CategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const categorySlug = params.category as string;
  const isSearchPage = categorySlug === 'search';
  const searchQuery = searchParams.get('q') || '';

  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, hasItem } = useWishlistStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // States matching URL params
  const [priceMin, setPriceMin] = useState(searchParams.get('priceMin') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('priceMax') || '');
  const [selectedColor, setSelectedColor] = useState(searchParams.get('color') || '');
  const [selectedSize, setSelectedSize] = useState(searchParams.get('size') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'latest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1') || 1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const colors = ['Matte Black', 'Pure White', 'Olive Green', 'Slate Grey', 'Military Olive', 'Dark Navy', 'Off-White', 'Acid Black', 'Heather Grey', 'Warm Beige', 'Champagne Gold', 'Emerald Green', 'Matte Cream', 'Midnight Black', 'Oatmeal Melange', 'Sage Green', 'Natural Sand', 'Soft Blue', 'Cacao Brown', 'Pure Onyx', 'Desert Taupe', 'Classic Camel', 'Neon Volt', 'Triple White', 'Triple Black', 'Bordeaux Burgundy', 'Classic Black', 'Tan Beige', 'Chocolate Brown', 'Off-White Green', 'Off-White Navy', 'Tan Brown', 'Khaki Sand', 'Coal Black', 'Tan Leather', 'Nero Black'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', '26', '28', '30', '32', '34', '36', '39', '40', '41', '42', '43', '44', '45', 'One Size'];

  // Sync state from query string on load
  useEffect(() => {
    setPriceMin(searchParams.get('priceMin') || '');
    setPriceMax(searchParams.get('priceMax') || '');
    setSelectedColor(searchParams.get('color') || '');
    setSelectedSize(searchParams.get('size') || '');
    setSort(searchParams.get('sort') || 'latest');
    setPage(parseInt(searchParams.get('page') || '1') || 1);
  }, [searchParams]);

  // Fetch products when filters or url parameters change
  useEffect(() => {
    async function fetchFilteredProducts() {
      setLoading(true);
      try {
        let url = '';
        if (isSearchPage) {
          url = `/api/v1/products/search?q=${searchQuery}`;
        } else {
          const queryParts = [];
          if (categorySlug) queryParts.push(`category=${categorySlug}`);
          if (priceMin) queryParts.push(`priceMin=${priceMin}`);
          if (priceMax) queryParts.push(`priceMax=${priceMax}`);
          if (selectedColor) queryParts.push(`color=${selectedColor}`);
          if (selectedSize) queryParts.push(`size=${selectedSize}`);
          if (sort) queryParts.push(`sort=${sort}`);
          queryParts.push(`page=${page}`);
          queryParts.push(`limit=12`);

          url = `/api/v1/products?${queryParts.join('&')}`;
        }

        const res = await fetch(url);
        const result = await res.json();
        if (result.success) {
          setProducts(result.data);
          if (result.pagination) {
            setPagination(result.pagination);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchFilteredProducts();
  }, [categorySlug, searchQuery, priceMin, priceMax, selectedColor, selectedSize, sort, page, isSearchPage]);

  // Update query parameters in URL
  const updateUrl = (updatedParams: Record<string, string | number>) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    Object.entries(updatedParams).forEach(([key, value]) => {
      if (value === '') {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(value));
      }
    });
    router.push(`/${categorySlug}?${nextParams.toString()}`);
  };

  const handlePriceChange = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ priceMin, priceMax, page: 1 });
  };

  const handleColorSelect = (color: string) => {
    const nextColor = selectedColor === color ? '' : color;
    setSelectedColor(nextColor);
    updateUrl({ color: nextColor, page: 1 });
  };

  const handleSizeSelect = (size: string) => {
    const nextSize = selectedSize === size ? '' : size;
    setSelectedSize(nextSize);
    updateUrl({ size: nextSize, page: 1 });
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    updateUrl({ sort: newSort, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrl({ page: newPage });
  };

  const handleClearFilters = () => {
    setPriceMin('');
    setPriceMax('');
    setSelectedColor('');
    setSelectedSize('');
    setSort('latest');
    setPage(1);
    router.push(`/${categorySlug}`);
  };

  const handleQuickAdd = (e: React.MouseEvent, prod: Product) => {
    e.preventDefault();
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

  // Convert category slug to Title
  const getPageTitle = () => {
    if (isSearchPage) return `Search Results for "${searchQuery}"`;
    return categorySlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* --- Breadcrumbs --- */}
      <div className="text-brand-gray text-xs font-ui uppercase tracking-wider flex items-center gap-2">
        <Link href="/" className="hover:text-white">Home</Link>
        <span>/</span>
        <span className="text-white font-semibold">{getPageTitle()}</span>
      </div>

      {/* --- Page Title & Sorting Header --- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6 gap-4">
        <h1 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-wide">{getPageTitle()}</h1>
        
        <div className="flex items-center justify-between sm:justify-end gap-4 font-ui">
          <button 
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center gap-2 border border-white/10 px-4 py-2 text-xs font-semibold rounded text-white/80"
          >
            <SlidersHorizontal size={14} /> Filters
          </button>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-brand-gray">Sort by:</span>
            <div className="relative group">
              <button className="flex items-center gap-1 border border-white/10 px-4 py-2 rounded text-white/90 font-semibold text-xs hover:border-brand-blue transition-colors">
                {sort === 'latest' && 'Latest Arrivals'}
                {sort === 'price_asc' && 'Price: Low to High'}
                {sort === 'price_desc' && 'Price: High to Low'}
                {sort === 'best_selling' && 'Best Selling'}
                <ChevronDown size={12} />
              </button>
              <div className="absolute right-0 top-full mt-1 bg-brand-darkGray border border-white/10 rounded shadow-2xl py-1 hidden group-hover:block w-44 z-30 text-xs">
                <button onClick={() => handleSortChange('latest')} className="w-full text-left px-4 py-2 hover:bg-white/5 text-white/80 hover:text-white">Latest Arrivals</button>
                <button onClick={() => handleSortChange('price_asc')} className="w-full text-left px-4 py-2 hover:bg-white/5 text-white/80 hover:text-white">Price: Low to High</button>
                <button onClick={() => handleSortChange('price_desc')} className="w-full text-left px-4 py-2 hover:bg-white/5 text-white/80 hover:text-white">Price: High to Low</button>
                <button onClick={() => handleSortChange('best_selling')} className="w-full text-left px-4 py-2 hover:bg-white/5 text-white/80 hover:text-white">Best Selling</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Section --- */}
      <div className="flex gap-8 items-start">
        
        {/* --- SIDEBAR FILTERS (DESKTOP) --- */}
        {!isSearchPage && (
          <aside className="hidden lg:block w-64 flex-shrink-0 space-y-8 sticky top-28 bg-brand-darkGray/20 border border-white/5 p-6 rounded">
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="font-ui font-bold text-xs uppercase tracking-wider text-white">Filters</span>
              {(priceMin || priceMax || selectedColor || selectedSize) && (
                <button onClick={handleClearFilters} className="text-brand-gold text-[10px] uppercase font-bold hover:text-white transition-colors">
                  Clear All
                </button>
              )}
            </div>

            {/* Price Filter */}
            <div className="space-y-3">
              <h4 className="text-white font-ui font-semibold text-xs uppercase tracking-wider">Price Range</h4>
              <form onSubmit={handlePriceChange} className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="input-field py-1 px-2 text-xs"
                />
                <span className="text-brand-gray">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="input-field py-1 px-2 text-xs"
                />
                <button type="submit" className="bg-brand-blue hover:bg-brand-blue/90 text-white rounded px-2.5 py-1.5 text-[10px] font-bold">
                  Go
                </button>
              </form>
            </div>

            {/* Colors Filter */}
            <div className="space-y-3">
              <h4 className="text-white font-ui font-semibold text-xs uppercase tracking-wider">Colors</h4>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                {colors.slice(0, 16).map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`text-[10px] font-ui px-2 py-1 rounded border transition-colors ${
                      selectedColor === color 
                        ? 'bg-brand-blue border-brand-blue text-white' 
                        : 'bg-transparent border-white/15 text-white/70 hover:border-white/30'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes Filter */}
            <div className="space-y-3">
              <h4 className="text-white font-ui font-semibold text-xs uppercase tracking-wider">Sizes</h4>
              <div className="flex flex-wrap gap-1.5">
                {sizes.slice(0, 12).map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeSelect(size)}
                    className={`w-9 h-9 font-ui text-xs font-semibold rounded border flex items-center justify-center transition-colors ${
                      selectedSize === size 
                        ? 'bg-brand-blue border-brand-blue text-white' 
                        : 'bg-transparent border-white/15 text-white/70 hover:border-white/30'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* --- PRODUCT GRID --- */}
        <div className="flex-grow space-y-10">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="space-y-4 animate-pulse">
                  <div className="h-80 bg-brand-darkGray rounded" />
                  <div className="h-4 bg-brand-darkGray rounded w-2/3" />
                  <div className="h-4 bg-brand-darkGray rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center space-y-4 font-ui border border-white/5 rounded bg-white/[0.01]">
              <div className="text-brand-gray text-sm">No items found matching the selected filter options.</div>
              <button onClick={handleClearFilters} className="btn-secondary py-2 px-6 text-xs font-bold inline-flex">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((prod) => {
                  const finalPrice = prod.price * (1 - prod.discountPct / 100);
                  const isWishlisted = hasItem(prod.id);
                  return (
                    <div key={prod.id} className="group relative space-y-3 bg-white/[0.01] border border-white/5 p-3 rounded hover:border-white/10 transition-colors">
                      <Link href={`/products/${prod.slug}`} className="block relative aspect-[4/5] bg-brand-darkGray overflow-hidden rounded">
                        <img 
                          src={prod.images?.[0]?.url || 'https://placehold.co/400x500'} 
                          alt={prod.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {prod.discountPct > 0 && (
                          <span className="absolute top-3 left-3 bg-brand-blue text-white text-[9px] font-bold px-2 py-0.5 rounded">
                            {prod.discountPct}% OFF
                          </span>
                        )}
                        <button 
                          onClick={(e) => { e.preventDefault(); toggleWishlist(prod.id); }}
                          className={`absolute top-3 right-3 p-1.5 rounded-full border backdrop-blur-md transition-colors ${
                            isWishlisted 
                              ? 'bg-brand-gold border-brand-gold text-brand-black' 
                              : 'bg-brand-black/40 border-white/10 text-white hover:bg-brand-black'
                          }`}
                        >
                          <Heart size={13} fill={isWishlisted ? 'currentColor' : 'none'} />
                        </button>
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
                                <span className="text-brand-gold font-semibold">₹{finalPrice.toLocaleString()}</span>
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

              {/* --- PAGINATION CONTROLS --- */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-10 border-t border-white/5 font-ui text-sm">
                  <button 
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                    className="border border-white/10 hover:border-brand-blue disabled:opacity-30 disabled:hover:border-white/10 px-4 py-2 rounded text-xs font-semibold transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-brand-gray">Page <strong className="text-white">{page}</strong> of {pagination.pages}</span>
                  <button 
                    disabled={page === pagination.pages}
                    onClick={() => handlePageChange(page + 1)}
                    className="border border-white/10 hover:border-brand-blue disabled:opacity-30 disabled:hover:border-white/10 px-4 py-2 rounded text-xs font-semibold transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* --- MOBILE FILTERS OVERLAY --- */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowMobileFilters(false)} />
          <div className="relative w-80 max-w-sm bg-brand-darkGray h-full flex flex-col p-6 shadow-2xl animate-fade-in z-50">
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="font-ui font-bold text-xs uppercase tracking-wider text-white">Filters</span>
              <button onClick={() => setShowMobileFilters(false)} className="text-white/60 hover:text-white">
                <ChevronDown size={20} className="rotate-90" />
              </button>
            </div>
            {/* Scrollable Filters */}
            <div className="flex-1 overflow-y-auto space-y-6 py-6">
              {/* Price Filter */}
              <div className="space-y-3">
                <h4 className="text-white font-ui font-semibold text-xs uppercase tracking-wider">Price Range</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="input-field py-1 px-2 text-xs"
                  />
                  <span className="text-brand-gray">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="input-field py-1 px-2 text-xs"
                  />
                </div>
              </div>

              {/* Colors Filter */}
              <div className="space-y-3">
                <h4 className="text-white font-ui font-semibold text-xs uppercase tracking-wider">Colors</h4>
                <div className="flex flex-wrap gap-1.5">
                  {colors.slice(0, 12).map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={`text-[10px] font-ui px-2 py-1 rounded border transition-colors ${
                        selectedColor === color 
                          ? 'bg-brand-blue border-brand-blue text-white' 
                          : 'bg-transparent border-white/15 text-white/70'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes Filter */}
              <div className="space-y-3">
                <h4 className="text-white font-ui font-semibold text-xs uppercase tracking-wider">Sizes</h4>
                <div className="flex flex-wrap gap-1.5">
                  {sizes.slice(0, 10).map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeSelect(size)}
                      className={`w-9 h-9 font-ui text-xs font-semibold rounded border flex items-center justify-center transition-colors ${
                        selectedSize === size 
                          ? 'bg-brand-blue border-brand-blue text-white' 
                          : 'bg-transparent border-white/15 text-white/70'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-2">
              <button 
                onClick={() => {
                  updateUrl({ priceMin, priceMax, color: selectedColor, size: selectedSize, page: 1 });
                  setShowMobileFilters(false);
                }}
                className="btn-primary w-full py-2.5 text-xs font-bold uppercase"
              >
                Apply Filters
              </button>
              <button 
                onClick={() => {
                  handleClearFilters();
                  setShowMobileFilters(false);
                }}
                className="btn-secondary w-full py-2.5 text-xs font-bold uppercase"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
