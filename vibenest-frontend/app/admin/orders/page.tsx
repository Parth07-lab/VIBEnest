'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { ShoppingCart, Check, RefreshCw, AlertCircle, Eye } from 'lucide-react';

export default function AdminOrdersPage() {
  const { adminToken } = useAuthStore();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Status change state
  const [updatingId, setUpdatingId] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/orders', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const result = await res.json();
      if (result.success) {
        setOrders(result.data);
      }
    } catch (e) {
      setError('Failed to fetch admin order queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchOrders();
    }
  }, [adminToken]);

  const handleUpdateStatus = async (orderId: string, updates: { status?: string; paymentStatus?: string }) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/v1/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(updates)
      });
      const result = await res.json();
      if (result.success) {
        // Update local state smoothly
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
      } else {
        alert(result.message || 'Fulfillment update failed.');
      }
    } catch (e) {
      alert('Connection error.');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <div className="space-y-6 font-ui text-sm">
      <div>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wider text-white">Order Pipeline</h1>
        <p className="text-brand-gray text-xs">Manage order fulfillment, delivery tracking, and payments status</p>
      </div>

      {loading ? (
        <p className="text-brand-gray text-xs py-10">Fetching orders queue...</p>
      ) : error ? (
        <p className="text-red-400 text-xs py-10">{error}</p>
      ) : (
        <div className="bg-brand-darkGray/10 border border-white/5 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs font-ui">
            <thead>
              <tr className="border-b border-white/5 bg-brand-darkGray/15 text-brand-gray/80 pb-2 uppercase tracking-wider font-bold">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4 text-right">Invoice Total</th>
                <th className="p-4 text-center">Fulfillment Status</th>
                <th className="p-4 text-center">Payment status</th>
                <th className="p-4 text-right">Purchase Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.01]">
                  <td className="p-4 font-mono uppercase text-white font-bold">{order.id.slice(0, 8)}</td>
                  <td className="p-4 space-y-0.5">
                    <span className="font-semibold block">{order.user?.name || 'Guest User'}</span>
                    <span className="text-brand-gray text-[10px] block truncate max-w-xs">{order.user?.email || 'N/A'}</span>
                  </td>
                  <td className="p-4 text-right font-bold text-brand-gold">₹{order.totalAmount.toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <div className="relative inline-block">
                      <select
                        value={order.status}
                        onChange={e => handleUpdateStatus(order.id, { status: e.target.value })}
                        disabled={updatingId === order.id}
                        className={`text-[10px] font-bold uppercase rounded px-2.5 py-1 text-center bg-brand-black border border-white/10 outline-none cursor-pointer focus:border-brand-blue ${
                          order.status === 'delivered' ? 'text-green-400' :
                          order.status === 'cancelled' ? 'text-red-400' :
                          'text-brand-blue'
                        }`}
                      >
                        <option value="pending" className="bg-brand-darkGray">Pending</option>
                        <option value="confirmed" className="bg-brand-darkGray">Confirmed</option>
                        <option value="shipped" className="bg-brand-darkGray">Shipped</option>
                        <option value="delivered" className="bg-brand-darkGray">Delivered</option>
                        <option value="cancelled" className="bg-brand-darkGray">Cancelled</option>
                      </select>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <select
                      value={order.paymentStatus}
                      onChange={e => handleUpdateStatus(order.id, { paymentStatus: e.target.value })}
                      disabled={updatingId === order.id}
                      className={`text-[10px] font-bold uppercase rounded px-2.5 py-1 text-center bg-brand-black border border-white/10 outline-none cursor-pointer focus:border-brand-blue ${
                        order.paymentStatus === 'paid' ? 'text-green-400' :
                        order.paymentStatus === 'refunded' ? 'text-brand-gold' :
                        'text-red-400'
                      }`}
                    >
                      <option value="pending" className="bg-brand-darkGray">Pending</option>
                      <option value="paid" className="bg-brand-darkGray">Paid</option>
                      <option value="failed" className="bg-brand-darkGray">Failed</option>
                      <option value="refunded" className="bg-brand-darkGray">Refunded</option>
                    </select>
                  </td>
                  <td className="p-4 text-right text-brand-gray font-semibold">
                    {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
