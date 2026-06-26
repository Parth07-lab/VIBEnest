'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../../store/useAuthStore';
import { ShoppingBag, ChevronRight, X, AlertCircle } from 'lucide-react';
import { Order } from '../../../types/shared-types';

export default function OrdersPage() {
  const { token } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (result.success) {
        setOrders(result.data);
      }
    } catch (e) {
      setError('Failed to load order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await fetch(`/api/v1/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (result.success) {
        fetchOrders(); // Refresh order records
      } else {
        alert(result.message || 'Failed to cancel order.');
      }
    } catch (e) {
      alert('Connection error.');
    }
  };

  return (
    <div className="space-y-6 font-ui">
      <div>
        <h2 className="font-display text-xl font-bold uppercase tracking-wider text-white">Order History</h2>
        <p className="text-brand-gray text-xs">View status and track deliveries of your purchases</p>
      </div>

      {loading ? (
        <div className="text-brand-gray text-xs py-8">Fetching orders...</div>
      ) : error ? (
        <div className="text-red-400 text-xs py-8">{error}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-brand-gray/60 space-y-4">
          <ShoppingBag size={40} className="mx-auto text-brand-gray/20" />
          <p className="text-sm">You haven't placed any orders yet.</p>
          <Link href="/men-clothing" className="btn-primary text-xs py-2 px-6 inline-flex">Go Shop</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-white/5 bg-white/[0.01] rounded-lg p-6 space-y-4">
              <div className="flex flex-wrap justify-between items-center pb-4 border-b border-white/5 gap-2 text-xs">
                <div>
                  <span className="text-brand-gray">Order ID: </span>
                  <span className="text-white font-bold uppercase">{order.id.slice(0, 8)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-brand-gray">Date: </span>
                  <span className="text-white font-semibold">{new Date(order.createdAt).toLocaleDateString()}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    order.status === 'delivered' ? 'bg-green-500/25 text-green-400' :
                    order.status === 'cancelled' ? 'bg-red-500/25 text-red-400' :
                    'bg-brand-blue/25 text-brand-blue'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items in order */}
              <div className="space-y-3">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex gap-4 text-xs">
                    <img 
                      src={item.product?.images?.[0]?.url || 'https://placehold.co/100x120'} 
                      alt={item.product?.name} 
                      className="w-10 h-12 object-cover rounded bg-brand-darkGray" 
                    />
                    <div className="flex-grow min-w-0">
                      <h4 className="text-white font-semibold truncate">{item.product?.name}</h4>
                      <p className="text-brand-gray text-[10px] mt-0.5">Size: {item.variant?.size} · Color: {item.variant?.color} · Qty: {item.qty}</p>
                    </div>
                    <span className="font-semibold text-brand-gold">₹{(item.unitPrice * item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Delivery tracking status timeline */}
              {order.status !== 'cancelled' && (
                <div className="border-t border-white/5 pt-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-brand-gray block mb-3">Delivery Tracking</span>
                  <div className="grid grid-cols-4 gap-1 text-center font-ui text-[9px] uppercase tracking-wider font-semibold text-brand-gray">
                    <div className="space-y-1.5">
                      <div className="h-1.5 rounded-full bg-brand-blue" />
                      <span className="text-white">Placed</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className={`h-1.5 rounded-full ${['confirmed', 'shipped', 'delivered'].includes(order.status) ? 'bg-brand-blue' : 'bg-brand-gray/20'}`} />
                      <span>Confirmed</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className={`h-1.5 rounded-full ${['shipped', 'delivered'].includes(order.status) ? 'bg-brand-blue' : 'bg-brand-gray/20'}`} />
                      <span>Shipped</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className={`h-1.5 rounded-full ${order.status === 'delivered' ? 'bg-green-400' : 'bg-brand-gray/20'}`} />
                      <span>Delivered</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Total details + Cancel button */}
              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <div className="text-xs">
                  <span className="text-brand-gray">Paid: </span>
                  <strong className="text-brand-gold text-sm font-bold">₹{order.totalAmount.toLocaleString()}</strong>
                </div>

                {order.status === 'pending' && (
                  <button 
                    onClick={() => handleCancelOrder(order.id)}
                    className="border border-red-500/20 hover:bg-red-500/10 text-red-400 font-bold px-3 py-1.5 rounded text-[10px] uppercase transition-colors"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
