'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { CreditCard, ShoppingBag, ShieldCheck, CheckCircle2, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items: cartItems, getTotals, clearCart, coupon } = useCartStore();
  const { user, token } = useAuthStore();

  const [step, setStep] = useState(1); // 1: Contact, 2: Shipping, 3: Payment, 4: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Checkout Forms
  const [contactName, setContactName] = useState(user?.name || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');

  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('card'); // card, upi, cod
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  const { subtotal, discount, total } = getTotals();

  // Redirect if cart is empty and order not placed yet
  useEffect(() => {
    if (cartItems.length === 0 && step !== 4) {
      router.push('/');
    }
  }, [cartItems, step]);

  // Handle step submits
  const nextStep = () => {
    if (step === 1) {
      if (!contactName || !contactEmail || !contactPhone) {
        setError('Please fill in all contact fields.');
        return;
      }
    } else if (step === 2) {
      if (!line1 || !city || !state || !pincode) {
        setError('Please fill in all required shipping address fields.');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleOrderSubmission = async () => {
    setLoading(true);
    setError('');

    const payload = {
      items: cartItems.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        qty: item.qty
      })),
      newAddress: {
        line1,
        line2,
        city,
        state,
        pincode,
        isDefault: false
      },
      couponCode: coupon?.code || null,
      paymentProvider: paymentMethod
    };

    try {
      // If not logged in, checkout fails as token is required. We'll use bearer if logged in
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        setError('Please login to finalize your order.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/v1/orders/checkout', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (result.success) {
        setCreatedOrder(result.data);
        clearCart();
        setStep(4);
      } else {
        setError(result.message || 'Failed to submit order. Check variants availability.');
      }
    } catch (err) {
      setError('Connection to order service failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LEFT COLUMN: Checkout Form */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Progress bar */}
          {step < 4 && (
            <div className="flex justify-between items-center bg-brand-darkGray/30 border border-white/5 rounded-lg p-4 font-ui text-xs text-white/50">
              <span className={`flex items-center gap-1.5 ${step >= 1 ? 'text-white font-bold' : ''}`}>
                1. Contact <ChevronRight size={12} />
              </span>
              <span className={`flex items-center gap-1.5 ${step >= 2 ? 'text-white font-bold' : ''}`}>
                2. Shipping <ChevronRight size={12} />
              </span>
              <span className={`flex items-center gap-1.5 ${step >= 3 ? 'text-white font-bold' : ''}`}>
                3. Payment
              </span>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded flex items-center gap-2 font-ui animate-fade-in">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: CONTACT INFO */}
          {step === 1 && (
            <div className="glassmorphism-card p-6 rounded-lg space-y-6">
              <h2 className="font-display text-xl font-bold uppercase tracking-wider text-white">1. Contact Information</h2>
              {!token && (
                <div className="bg-brand-blue/10 border border-brand-blue/20 text-white text-xs px-4 py-2.5 rounded font-ui flex justify-between items-center">
                  <span>Sign in to complete checkout with your profile details and saved addresses.</span>
                  <Link href="/login" className="text-brand-gold font-bold hover:underline">Log In</Link>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-ui text-sm">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs uppercase font-bold text-white/70">Full Name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Full name"
                    className="input-field"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold text-white/70">Email Address</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="input-field"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold text-white/70">Phone Number</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="input-field"
                  />
                </div>
              </div>
              <button onClick={nextStep} className="btn-primary w-full py-3 text-xs font-bold uppercase tracking-wider">
                Continue to Shipping Address
              </button>
            </div>
          )}

          {/* STEP 2: SHIPPING ADDRESS */}
          {step === 2 && (
            <div className="glassmorphism-card p-6 rounded-lg space-y-6 animate-fade-in">
              <h2 className="font-display text-xl font-bold uppercase tracking-wider text-white">2. Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 font-ui text-sm">
                <div className="space-y-1.5 md:col-span-6">
                  <label className="text-xs uppercase font-bold text-white/70">Address Line 1</label>
                  <input
                    type="text"
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                    placeholder="Apartment, suite, unit, building, street address"
                    className="input-field"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-6">
                  <label className="text-xs uppercase font-bold text-white/70">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    value={line2}
                    onChange={(e) => setLine2(e.target.value)}
                    placeholder="Floor, apartment number, landmark"
                    className="input-field"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs uppercase font-bold text-white/70">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="input-field"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs uppercase font-bold text-white/70">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="input-field"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs uppercase font-bold text-white/70">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="6-digit pincode"
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={prevStep} className="btn-secondary flex-1 py-3 text-xs font-bold uppercase tracking-wider">
                  Back
                </button>
                <button onClick={nextStep} className="btn-primary flex-1 py-3 text-xs font-bold uppercase tracking-wider">
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD */}
          {step === 3 && (
            <div className="glassmorphism-card p-6 rounded-lg space-y-6 animate-fade-in">
              <h2 className="font-display text-xl font-bold uppercase tracking-wider text-white">3. Select Payment Method</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-ui">
                {[
                  { id: 'card', name: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
                  { id: 'upi', name: 'Instant UPI', desc: 'GPay, PhonePe, BHIM' },
                  { id: 'cod', name: 'Cash On Delivery (COD)', desc: 'Pay with cash at delivery' }
                ].map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`p-4 rounded border text-left flex flex-col justify-between h-28 transition-colors ${
                      paymentMethod === pm.id
                        ? 'border-brand-blue bg-brand-blue/10 text-white'
                        : 'border-white/10 hover:border-white/20 bg-white/[0.01] text-white/70'
                    }`}
                  >
                    <span className="text-sm font-bold">{pm.name}</span>
                    <span className="text-[11px] text-brand-gray/80 leading-snug">{pm.desc}</span>
                  </button>
                ))}
              </div>

              {paymentMethod === 'card' && (
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded space-y-3 font-ui text-sm animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-bold text-white/70">Card Number</label>
                    <input type="text" placeholder="1234 5678 1234 5678" className="input-field" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase font-bold text-white/70">Expiry Date</label>
                      <input type="text" placeholder="MM/YY" className="input-field" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase font-bold text-white/70">CVV</label>
                      <input type="password" placeholder="***" className="input-field" />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded space-y-3 font-ui text-sm animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-bold text-white/70">UPI ID</label>
                    <input type="text" placeholder="username@upi" className="input-field" />
                  </div>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded space-y-3 font-ui text-xs text-white/70 leading-relaxed animate-fade-in">
                  An additional COD processing charge might apply. Please ensure you are available at the address with cash when delivery agent arrives.
                </div>
              )}

              <div className="flex gap-4">
                <button onClick={prevStep} className="btn-secondary flex-1 py-3 text-xs font-bold uppercase tracking-wider">
                  Back
                </button>
                <button 
                  onClick={handleOrderSubmission}
                  disabled={loading}
                  className="btn-primary flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <>
                      Confirm & Pay (₹{total.toLocaleString()})
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ORDER SUCCESS SCREEN */}
          {step === 4 && createdOrder && (
            <div className="glassmorphism-card p-8 rounded-lg text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-3xl font-bold uppercase tracking-wider text-white">ORDER PLACED</h2>
                <p className="text-brand-gray text-xs font-ui uppercase tracking-widest">Thank you for shopping at VibeNest</p>
              </div>

              <div className="max-w-md mx-auto bg-white/[0.02] border border-white/5 rounded-lg p-6 text-left space-y-4 font-ui text-xs text-white/80">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Order Reference</span>
                  <strong className="text-white font-bold uppercase">{createdOrder.id.slice(0, 8)}</strong>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Amount Invoiced</span>
                  <strong className="text-brand-gold font-bold">₹{createdOrder.totalAmount.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Delivery Address</span>
                  <span className="text-right text-white/60">
                    {createdOrder.shippingAddress.line1}, {createdOrder.shippingAddress.city}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="bg-green-500/20 text-green-400 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                    {createdOrder.status}
                  </span>
                </div>
              </div>

              <div className="pt-6 flex flex-wrap justify-center gap-4">
                <Link href="/account/orders" className="btn-primary px-8 py-3 text-xs font-bold uppercase tracking-wider">
                  Track Order
                </Link>
                <Link href="/" className="btn-secondary px-8 py-3 text-xs font-bold uppercase tracking-wider">
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Order Summary Sidecard (only visible during step 1-3) */}
        {step < 4 && (
          <div className="lg:col-span-4 bg-brand-darkGray/25 border border-white/5 rounded-lg p-6 space-y-6 font-ui">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white border-b border-white/10 pb-4 flex items-center gap-2">
              <ShoppingBag size={16} className="text-brand-blue" />
              Order Summary ({cartItems.reduce((acc, i) => acc + i.qty, 0)})
            </h3>

            {/* Cart Items list */}
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {cartItems.map((item) => {
                const priceFinal = item.price * (1 - item.discountPct / 100);
                return (
                  <div key={item.variantId} className="flex gap-3 text-xs border-b border-white/5 pb-3">
                    <img src={item.imageUrl} alt={item.name} className="w-12 h-15 object-cover rounded bg-brand-black flex-shrink-0" />
                    <div className="flex-grow min-w-0">
                      <h4 className="text-white font-semibold truncate">{item.name}</h4>
                      <p className="text-brand-gray text-[10px] mt-0.5">Size: {item.size} · Color: {item.color} · Qty: {item.qty}</p>
                    </div>
                    <span className="font-semibold text-white/90">₹{(priceFinal * item.qty).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>

            {/* Pricing Details */}
            <div className="space-y-2 border-t border-white/10 pt-4 text-xs">
              <div className="flex justify-between text-brand-gray">
                <span>Subtotal</span>
                <span className="text-white font-semibold">₹{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount code</span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-brand-gray">
                <span>Shipping</span>
                <span className="text-green-400 font-semibold font-ui uppercase text-[10px]">Free</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-3 text-white font-bold text-sm">
                <span>Order Total</span>
                <span className="text-brand-gold">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-white/50 text-[10px]">
              <ShieldCheck size={14} className="text-brand-gold" />
              <span>Payments are processed securely via SSL.</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
