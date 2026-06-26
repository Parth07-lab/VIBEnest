'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { BadgePercent, Plus, Check, RefreshCw, AlertCircle, X } from 'lucide-react';
import { Coupon } from '../../../types/shared-types';

export default function AdminCouponsPage() {
  const { adminToken } = useAuthStore();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Coupon Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [value, setValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('0');
  const [usageLimit, setUsageLimit] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const [success, setSuccess] = useState('');

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/admin/coupons', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const result = await res.json();
      if (result.success) {
        setCoupons(result.data);
      }
    } catch (e) {
      setError('Failed to fetch coupons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchCoupons();
    }
  }, [adminToken]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || value === undefined || !expiresAt) {
      setError('Please fill in required fields.');
      return;
    }

    setError('');
    setSuccess('');

    const payload = {
      code: code.toUpperCase(),
      discountType,
      value: parseFloat(value),
      minOrderValue: parseFloat(minOrderValue),
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      expiresAt: new Date(expiresAt)
    };

    try {
      const res = await fetch('http://localhost:5000/api/v1/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (result.success) {
        setSuccess('Coupon code active!');
        setShowAddForm(false);
        fetchCoupons();

        // Reset Form
        setCode('');
        setValue('');
        setMinOrderValue('0');
        setUsageLimit('');
        setExpiresAt('');
      } else {
        setError(result.message || 'Failed to create coupon.');
      }
    } catch (e) {
      setError('Connection to admin API failed.');
    }
  };

  return (
    <div className="space-y-6 font-ui text-sm">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wider text-white">Coupons & Promos</h1>
          <p className="text-brand-gray text-xs">Create custom discount campaigns and track voucher usage statistics</p>
        </div>
        {!showAddForm && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="btn-primary py-2 px-6 text-xs font-bold flex items-center gap-1"
          >
            <Plus size={14} /> Create Coupon
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateCoupon} className="bg-brand-darkGray/25 border border-white/5 p-6 rounded-lg space-y-4 max-w-lg animate-fade-in">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="font-semibold text-white">Activate Discount Voucher</h3>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-brand-gray/60 hover:text-white">
              <X size={16} />
            </button>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-white/70">Promo Code *</label>
              <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="NESTMBA" className="input-field py-1.5 uppercase" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-white/70">Discount Metric *</label>
              <select value={discountType} onChange={e => setDiscountType(e.target.value)} className="input-field py-1.5">
                <option value="percentage" className="bg-brand-darkGray">Percentage (%)</option>
                <option value="fixed" className="bg-brand-darkGray">Fixed Cash Amount (INR)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-white/70">Discount Value *</label>
              <input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="15" className="input-field py-1.5" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-white/70">Min Purchase Requirement</label>
              <input type="number" value={minOrderValue} onChange={e => setMinOrderValue(e.target.value)} placeholder="0" className="input-field py-1.5" />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-white/70">Total Usage Cap</label>
              <input type="number" value={usageLimit} onChange={e => setUsageLimit(e.target.value)} placeholder="Unlimited" className="input-field py-1.5" />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-white/70">Campaign Expiration *</label>
              <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} className="input-field py-1.5" required />
            </div>
          </div>

          <div className="flex gap-4 pt-3 border-t border-white/5">
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary py-2 flex-1">Cancel</button>
            <button type="submit" className="btn-primary py-2 flex-1">Activate Coupon</button>
          </div>
        </form>
      )}

      {/* Coupons Table */}
      {loading ? (
        <p className="text-brand-gray text-xs py-10">Fetching voucher list...</p>
      ) : error ? (
        <p className="text-red-400 text-xs py-10">{error}</p>
      ) : (
        <div className="bg-brand-darkGray/10 border border-white/5 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs font-ui">
            <thead>
              <tr className="border-b border-white/5 bg-brand-darkGray/15 text-brand-gray/80 pb-2 uppercase tracking-wider font-bold">
                <th className="p-4">Voucher Code</th>
                <th className="p-4">Discount Type</th>
                <th className="p-4 text-right">Value</th>
                <th className="p-4 text-right">Min Order Requirement</th>
                <th className="p-4 text-right">Voucher Redemption</th>
                <th className="p-4 text-right">Expiration Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {coupons.map((coupon: any) => (
                <tr key={coupon.id} className="hover:bg-white/[0.01]">
                  <td className="p-4 font-mono uppercase text-brand-gold font-bold">{coupon.code}</td>
                  <td className="p-4 uppercase font-bold text-white/70">{coupon.discountType}</td>
                  <td className="p-4 text-right font-semibold">
                    {coupon.discountType === 'percentage' ? `${coupon.value}% Off` : `₹${coupon.value.toLocaleString()}`}
                  </td>
                  <td className="p-4 text-right text-brand-gray">₹{coupon.minOrderValue.toLocaleString()}</td>
                  <td className="p-4 text-right font-semibold">
                    {coupon.usedCount} / {coupon.usageLimit !== null ? coupon.usageLimit : '∞'}
                  </td>
                  <td className="p-4 text-right text-brand-gray font-semibold">
                    {new Date(coupon.expiresAt).toLocaleDateString()}
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
