'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { Users, ShieldAlert, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

export default function AdminUsersPage() {
  const { adminToken } = useAuthStore();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Suspension action tracking
  const [submittingId, setSubmittingId] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/users', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const result = await res.json();
      if (result.success) {
        setUsers(result.data);
      }
    } catch (e) {
      setError('Failed to fetch customer directories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchUsers();
    }
  }, [adminToken]);

  const handleToggleSuspension = async (userId: string, isCurrentlySuspended: boolean) => {
    const action = isCurrentlySuspended ? 'unsuspend' : 'suspend';
    if (!confirm(`Are you sure you want to ${action} this customer?`)) return;

    setSubmittingId(userId);
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/suspend`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const result = await res.json();
      if (result.success) {
        // Toggle the deletedAt date locally
        setUsers(prev => prev.map(u => 
          u.id === userId 
            ? { ...u, deletedAt: isCurrentlySuspended ? null : new Date().toISOString() } 
            : u
        ));
      } else {
        alert(result.message || 'Suspension operation failed.');
      }
    } catch (e) {
      alert('Connection error.');
    } finally {
      setSubmittingId('');
    }
  };

  return (
    <div className="space-y-6 font-ui text-sm">
      <div>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wider text-white">Customer Database</h1>
        <p className="text-brand-gray text-xs">View registered profiles, log actions, and manage customer account permissions</p>
      </div>

      {loading ? (
        <p className="text-brand-gray text-xs py-10">Fetching customer listing...</p>
      ) : error ? (
        <p className="text-red-400 text-xs py-10">{error}</p>
      ) : (
        <div className="bg-brand-darkGray/10 border border-white/5 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs font-ui">
            <thead>
              <tr className="border-b border-white/5 bg-brand-darkGray/15 text-brand-gray/80 pb-2 uppercase tracking-wider font-bold">
                <th className="p-4">Customer Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Auth Provider</th>
                <th className="p-4 text-center">Security Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {users.map((user) => {
                const isSuspended = user.deletedAt !== null;
                return (
                  <tr key={user.id} className="hover:bg-white/[0.01]">
                    <td className="p-4 font-semibold">{user.name}</td>
                    <td className="p-4 font-mono text-brand-gray">{user.email}</td>
                    <td className="p-4 text-brand-gray">{user.phone || 'N/A'}</td>
                    <td className="p-4 uppercase text-[10px] font-bold text-white/70">{user.provider}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isSuspended ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-green-500/20 text-green-400 border border-green-500/20'
                      }`}>
                        {isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleSuspension(user.id, isSuspended)}
                        disabled={submittingId === user.id}
                        className={`text-[10px] font-bold uppercase rounded px-3 py-1.5 border transition-colors ${
                          isSuspended
                            ? 'border-green-500/30 hover:bg-green-500/10 text-green-400'
                            : 'border-red-500/30 hover:bg-red-500/10 text-red-400'
                        }`}
                      >
                        {submittingId === user.id ? 'Updating...' : isSuspended ? 'Unsuspend' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
