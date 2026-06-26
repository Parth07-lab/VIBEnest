'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { 
  ShoppingBag, Heart, User, Search, Menu, X, Plus, Minus, Trash2, LogOut, Check
} from 'lucide-react';
import { CartItem } from '../../types/shared-types';

export default function Navbar() {
  const router = useRouter();
  const { items: cartItems, updateQty, removeItem, getTotals, coupon, applyCoupon } = useCartStore();
  const { user, token, logout } = useAuthStore();
  const { productIds: wishlistItems } = useWishlistStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const { subtotal, discount, total } = getTotals();

  // Search autocomplete api handler
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/products/search?q=${searchQuery}`);
        const result = await res.json();
        if (result.success) {
          setSearchResults(result.data);
        }
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Apply Coupon code
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      // Stub verification of coupons local to catalog or fetch from API
      // Since couponCode VIBESTART / NESTMBA are seeded:
      let mockCoupon = null;
      if (couponCode.toUpperCase() === 'VIBESTART') {
        mockCoupon = { code: 'VIBESTART', discountType: 'percentage', value: 10, minOrderValue: 2000, expiresAt: new Date() };
      } else if (couponCode.toUpperCase() === 'NESTMBA') {
        mockCoupon = { code: 'NESTMBA', discountType: 'fixed', value: 500, minOrderValue: 4000, expiresAt: new Date() };
      }

      if (mockCoupon) {
        if (subtotal < mockCoupon.minOrderValue) {
          setCouponError(`Min order value is ₹${mockCoupon.minOrderValue}`);
          setCouponSuccess('');
        } else {
          applyCoupon(mockCoupon as any);
          setCouponSuccess('Coupon applied!');
          setCouponError('');
        }
      } else {
        setCouponError('Invalid coupon code');
        setCouponSuccess('');
      }
    } catch (e) {
      setCouponError('Failed to apply coupon');
    }
  };

  const handleRemoveCoupon = () => {
    applyCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/search?q=${searchQuery.trim()}`);
    }
  };

  const handleCheckoutRedirect = () => {
    setIsCartOpen(false);
    router.push('/checkout');
  };

  return (
    <>
      <header className="sticky top-0 z-50 glassmorphism transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-white/80 hover:text-white"
            >
              <Menu size={24} />
            </button>
            <Link href="/" className="font-display text-2xl font-bold tracking-widest text-white flex items-center">
              VIBE<span className="text-brand-blue">NEST</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 font-ui font-medium text-sm text-white/85">
            <Link href="/men-clothing" className="hover:text-brand-blue transition-colors uppercase tracking-wider">Men</Link>
            <Link href="/women-clothing" className="hover:text-brand-blue transition-colors uppercase tracking-wider">Women</Link>
            <Link href="/footwear" className="hover:text-brand-blue transition-colors uppercase tracking-wider">Footwear</Link>
            <Link href="/accessories" className="hover:text-brand-blue transition-colors uppercase tracking-wider">Accessories</Link>
          </nav>

          {/* Icons panel */}
          <div className="flex items-center gap-4 text-white/80">
            {/* Search Trigger */}
            <button onClick={() => setIsSearchOpen(true)} className="p-2 hover:text-brand-blue transition-colors">
              <Search size={20} />
            </button>

            {/* Wishlist Link */}
            <Link href="/account/wishlist" className="p-2 hover:text-brand-blue transition-colors relative">
              <Heart size={20} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-gold text-brand-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Trigger */}
            <button onClick={() => setIsCartOpen(true)} className="p-2 hover:text-brand-blue transition-colors relative">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-blue text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Dropdown */}
            {token ? (
              <div className="relative group py-2">
                <button className="flex items-center gap-1 p-2 hover:text-brand-blue transition-colors">
                  <User size={20} />
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-brand-darkGray border border-white/10 rounded shadow-2xl py-2 hidden group-hover:block transition-all animate-fade-in text-sm font-ui z-50">
                  <div className="px-4 py-2 border-b border-white/5 text-white font-semibold truncate">
                    Hi, {user?.name.split(' ')[0]}
                  </div>
                  <Link href="/account/profile" className="block px-4 py-2 hover:bg-white/5 text-white/80 hover:text-white">Profile Dashboard</Link>
                  <Link href="/account/orders" className="block px-4 py-2 hover:bg-white/5 text-white/80 hover:text-white">My Orders</Link>
                  <button 
                    onClick={() => { logout(); router.push('/'); }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-white/5 text-red-400 hover:text-red-300 mt-1 border-t border-white/5"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="p-2 hover:text-brand-blue transition-colors">
                <User size={20} />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* --- SEARCH OVERLAY --- */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-brand-black/95 backdrop-blur-md flex flex-col justify-start pt-20 px-4 sm:px-6 lg:px-8 animate-fade-in">
          <div className="max-w-3xl mx-auto w-full">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="font-display text-xl tracking-wider text-white">SEARCH CATALOG</span>
              <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="text-white/60 hover:text-white p-2">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSearchSubmit} className="mt-8 relative">
              <input
                type="text"
                autoFocus
                placeholder="Search premium apparel, footwear, accessories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-2xl font-body border-b-2 border-white/20 focus:border-brand-blue py-3 outline-none text-white placeholder:text-white/20"
              />
              <button type="submit" className="absolute right-0 top-3 text-white/60 hover:text-white p-2">
                <Search size={24} />
              </button>
            </form>

            {/* Results Autocomplete */}
            <div className="mt-8 space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              {searchResults.map((prod) => (
                <Link
                  key={prod.id}
                  href={`/products/${prod.slug}`}
                  onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                  className="flex items-center gap-4 p-2 bg-white/5 hover:bg-white/10 rounded transition-colors"
                >
                  <img src={prod.images?.[0]?.url || 'https://placehold.co/100x100'} alt={prod.name} className="w-12 h-12 object-cover rounded bg-brand-darkGray" />
                  <div className="flex-1">
                    <div className="text-white font-ui font-semibold text-sm">{prod.name}</div>
                    <div className="text-brand-gray text-xs">{prod.sku}</div>
                  </div>
                  <div className="text-brand-gold font-ui font-semibold text-sm">₹{prod.price.toLocaleString()}</div>
                </Link>
              ))}
              {searchQuery && searchResults.length === 0 && (
                <div className="text-white/40 text-center py-10 font-ui text-sm">No items found matching your query.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MOBILE NAV DRAWER --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-80 max-w-sm bg-brand-darkGray h-full flex flex-col p-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center pb-6 border-b border-white/5">
              <span className="font-display text-lg tracking-widest text-white">VIBENEST</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-white/60 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <nav className="flex flex-col gap-6 font-ui text-base font-medium mt-10">
              <Link href="/men-clothing" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-blue text-white py-2 border-b border-white/5">Men</Link>
              <Link href="/women-clothing" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-blue text-white py-2 border-b border-white/5">Women</Link>
              <Link href="/footwear" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-blue text-white py-2 border-b border-white/5">Footwear</Link>
              <Link href="/accessories" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-blue text-white py-2 border-b border-white/5">Accessories</Link>
            </nav>
          </div>
        </div>
      )}

      {/* --- CART DRAWER --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-brand-darkGray h-full flex flex-col shadow-2xl animate-fade-in z-50">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-brand-black">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-brand-blue" />
                <span className="font-display text-lg font-bold uppercase tracking-wider text-white">Shopping Cart ({cartCount})</span>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="text-white/60 hover:text-white p-2">
                <X size={20} />
              </button>
            </div>

            {/* Line Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center text-white/40 font-ui text-sm gap-4">
                  <ShoppingBag size={48} className="text-white/20" />
                  Your shopping cart is empty.
                  <button onClick={() => setIsCartOpen(false)} className="btn-primary text-xs py-2 px-4 mt-2">Shop Now</button>
                </div>
              ) : (
                cartItems.map((item) => {
                  const finalPrice = item.price * (1 - item.discountPct / 100);
                  return (
                    <div key={item.variantId} className="flex gap-4 p-4 bg-white/5 rounded border border-white/5 relative group">
                      <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded bg-brand-black flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-ui font-semibold text-sm truncate">{item.name}</div>
                        <div className="text-brand-gray text-xs mt-1 flex gap-2">
                          <span>Size: <strong className="text-white">{item.size}</strong></span>
                          <span>Color: <strong className="text-white">{item.color}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button 
                            onClick={() => updateQty(item.variantId, item.qty - 1)}
                            className="w-6 h-6 border border-white/10 hover:border-brand-blue rounded flex items-center justify-center text-white/80 hover:text-white transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="font-ui text-sm font-semibold w-6 text-center">{item.qty}</span>
                          <button 
                            onClick={() => updateQty(item.variantId, item.qty + 1)}
                            className="w-6 h-6 border border-white/10 hover:border-brand-blue rounded flex items-center justify-center text-white/80 hover:text-white transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="text-right flex flex-col justify-between items-end">
                        <button 
                          onClick={() => removeItem(item.variantId)}
                          className="text-white/40 hover:text-red-400 p-1 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="font-ui text-sm font-semibold text-brand-gold mt-2">
                          ₹{(finalPrice * item.qty).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Summary */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-brand-black space-y-4">
                {/* Coupon Code Block */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={!!coupon}
                      className="input-field py-2 text-sm uppercase flex-1"
                    />
                    {coupon ? (
                      <button 
                        onClick={handleRemoveCoupon}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-3 py-2 rounded text-xs transition-colors flex items-center gap-1 font-semibold"
                      >
                        Remove
                      </button>
                    ) : (
                      <button 
                        onClick={handleApplyCoupon}
                        className="bg-brand-blue hover:bg-brand-blue/90 text-white px-4 py-2 rounded text-xs font-semibold transition-colors"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                  {couponError && <p className="text-red-400 text-xs">{couponError}</p>}
                  {coupon && (
                    <p className="text-green-400 text-xs flex items-center gap-1">
                      <Check size={12} /> Active: <strong>{coupon.code}</strong> (₹{coupon.discountType === 'percentage' ? `${coupon.value}% Off` : `₹${coupon.value} Off`})
                    </p>
                  )}
                </div>

                <div className="space-y-2 border-t border-white/5 pt-3">
                  <div className="flex justify-between text-brand-gray text-sm">
                    <span>Subtotal</span>
                    <span className="text-white font-semibold">₹{subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-400 text-sm">
                      <span>Discount</span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-brand-gray text-sm">
                    <span>Estimated Shipping</span>
                    <span className="text-green-400 font-semibold font-ui uppercase text-[10px] border border-green-500/30 px-2 py-0.5 rounded">Free</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-3 text-white font-bold text-lg">
                    <span>Total Amount</span>
                    <span className="text-brand-gold">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <button 
                  onClick={handleCheckoutRedirect}
                  className="btn-primary w-full mt-4 py-3 text-sm font-bold uppercase tracking-wider"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
