'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { DollarSign, ShoppingCart, Users, Percent, TrendingUp, Package, ShieldAlert } from 'lucide-react';
import { DashboardStats } from '../../types/shared-types';

export default function AdminDashboardPage() {
  const { adminToken } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/v1/admin/analytics', {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });
        const result = await res.json();
        if (result.success) {
          setStats(result.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (adminToken) {
      fetchStats();
    }
  }, [adminToken]);

  if (loading || !stats) {
    return <div className="text-brand-gray text-xs">Computing analytics logs...</div>;
  }

  const COLORS = ['#0066FF', '#D4AF37', '#708090', '#556B2F'];

  const statsCards = [
    { title: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, change: '+12.4% vs last week', color: 'text-brand-gold' },
    { title: 'Orders Placed', value: stats.ordersCount, icon: ShoppingCart, change: '+4.8% vs last week', color: 'text-brand-blue' },
    { title: 'Customer Base', value: stats.usersCount, icon: Users, change: '+8.2% vs last week', color: 'text-white' },
    { title: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: Percent, change: '+0.4% vs last week', color: 'text-green-400' }
  ];

  return (
    <div className="space-y-10 font-ui text-sm">
      {/* Page Title */}
      <div>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wider text-white">Dashboard Overview</h1>
        <p className="text-brand-gray text-xs">Real-time storefront metrics and financial stats</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-brand-darkGray/35 border border-white/5 p-6 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-brand-gray/80 text-xs font-bold uppercase tracking-wider">{card.title}</span>
                <Icon size={16} className={card.color} />
              </div>
              <div className="space-y-1">
                <h3 className="text-white text-2xl font-bold font-display">{card.value}</h3>
                <p className="text-brand-gray/60 text-[10px] flex items-center gap-1">
                  <TrendingUp size={10} className="text-green-400" /> {card.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Panel (Only render in browser context to avoid SSR bugs) */}
      {mounted && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Weekly Sales Bar Chart */}
          <div className="lg:col-span-8 bg-brand-darkGray/25 border border-white/5 p-6 rounded-lg space-y-4">
            <h3 className="text-white font-semibold uppercase text-xs tracking-wider border-b border-white/5 pb-3">Weekly Sales Volume</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.weeklySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="name" stroke="#707070" fontSize={11} />
                  <YAxis stroke="#707070" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333' }} />
                  <Bar dataKey="sales" fill="#0066FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Sales Pie Chart */}
          <div className="lg:col-span-4 bg-brand-darkGray/25 border border-white/5 p-6 rounded-lg space-y-4">
            <h3 className="text-white font-semibold uppercase text-xs tracking-wider border-b border-white/5 pb-3">Sales share by Category</h3>
            <div className="h-80 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categorySales}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stats.categorySales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333' }} />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ fontSize: 10, paddingTop: 10 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Bottom aggregated tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top items table */}
        <div className="lg:col-span-7 bg-brand-darkGray/25 border border-white/5 p-6 rounded-lg space-y-4">
          <h3 className="text-white font-semibold uppercase text-xs tracking-wider border-b border-white/5 pb-3 flex items-center gap-1">
            <Package size={14} className="text-brand-blue" /> Top Selling Styles
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-ui">
              <thead>
                <tr className="border-b border-white/5 text-brand-gray/80 pb-2 uppercase tracking-wider font-bold">
                  <th className="py-2">Product Name</th>
                  <th className="py-2 text-right">Units Sold</th>
                  <th className="py-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {stats.topProducts.map((p, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.01]">
                    <td className="py-3 font-semibold">{p.name}</td>
                    <td className="py-3 text-right font-semibold">{p.sales} units</td>
                    <td className="py-3 text-right text-brand-gold font-bold">₹{p.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Audit quick view */}
        <div className="lg:col-span-5 bg-brand-darkGray/25 border border-white/5 p-6 rounded-lg space-y-4">
          <h3 className="text-white font-semibold uppercase text-xs tracking-wider border-b border-white/5 pb-3 flex items-center gap-1.5">
            <ShieldAlert size={14} className="text-brand-gold" /> System Integrity Logs
          </h3>
          <div className="space-y-3 text-[11px] font-ui">
            <div className="flex justify-between items-start border-b border-white/5 pb-2">
              <div>
                <span className="text-white font-bold block">ADMIN_LOGIN_SUCCESS</span>
                <span className="text-brand-gray/70">MFA token verified successfully</span>
              </div>
              <span className="text-brand-gray/50">Just now</span>
            </div>
            <div className="flex justify-between items-start border-b border-white/5 pb-2">
              <div>
                <span className="text-white font-bold block">CATALOG_SEED_SUCCESS</span>
                <span className="text-brand-gray/70">Loaded 25 luxury products</span>
              </div>
              <span className="text-brand-gray/50">2 hours ago</span>
            </div>
            <div className="flex justify-between items-start pb-1">
              <div>
                <span className="text-white font-bold block">ENVIRONMENT_SETUP</span>
                <span className="text-brand-gray/70">Prisma client generation completed</span>
              </div>
              <span className="text-brand-gray/50">3 hours ago</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
