'use client';

import { useState, useEffect } from 'react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Users, Ban, CheckCircle, Search, ShoppingBag, AlertTriangle } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  banned: boolean;
  createdAt: string;
  orders: Array<{
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetch('/api/admin/customers')
      .then(res => res.json())
      .then(data => {
        setCustomers(data);
        setIsLoading(false);
      });
  }, []);

  const handleBanToggle = async (customerId: string) => {
    const res = await fetch(`/api/admin/customers/${customerId}/ban`, {
      method: 'POST',
    });
    const data = await res.json();
    if (res.ok) {
      setCustomers(prev =>
        prev.map(c => c.id === customerId ? { ...c, banned: data.banned } : c)
      );
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(prev => prev ? { ...prev, banned: data.banned } : null);
      }
    }
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm mt-1">{customers.length} registered customers</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 input-field"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer list */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No customers found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => {
                  const totalSpent = customer.orders.reduce((sum, o) => sum + o.totalAmount, 0);
                  return (
                    <tr
                      key={customer.id}
                      className={`hover:bg-gray-50 cursor-pointer ${selectedCustomer?.id === customer.id ? 'bg-indigo-50' : ''}`}
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-indigo-600">{customer.name[0]}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                            <p className="text-xs text-gray-500">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(customer.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{customer.orders.length}</p>
                          <p className="text-xs text-gray-500">{formatCurrency(totalSpent)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge text-xs ${customer.banned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {customer.banned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleBanToggle(customer.id); }}
                          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                            customer.banned
                              ? 'bg-green-50 text-green-700 hover:bg-green-100'
                              : 'bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          {customer.banned ? (
                            <><CheckCircle className="h-3 w-3" /> Unban</>
                          ) : (
                            <><Ban className="h-3 w-3" /> Ban</>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Customer details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {selectedCustomer ? (
            <div>
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-indigo-600">{selectedCustomer.name[0]}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedCustomer.name}</h3>
                  <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                </div>
              </div>

              {selectedCustomer.banned && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg mb-4 text-sm text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  This account is banned
                </div>
              )}

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Member since</span>
                  <span className="font-medium text-gray-900">{formatDate(selectedCustomer.createdAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total orders</span>
                  <span className="font-medium text-gray-900">{selectedCustomer.orders.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total spent</span>
                  <span className="font-semibold text-indigo-600">
                    {formatCurrency(selectedCustomer.orders.reduce((sum, o) => sum + o.totalAmount, 0))}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleBanToggle(selectedCustomer.id)}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                  selectedCustomer.banned
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {selectedCustomer.banned ? (
                  <><CheckCircle className="h-4 w-4" /> Unban Customer</>
                ) : (
                  <><Ban className="h-4 w-4" /> Ban Customer</>
                )}
              </button>

              {selectedCustomer.orders.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-indigo-600" />
                    Recent Orders
                  </h4>
                  <div className="space-y-2">
                    {selectedCustomer.orders.slice(0, 4).map((order) => (
                      <div key={order.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-xs font-medium text-gray-900">#{order.id.slice(-6).toUpperCase()}</p>
                          <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                        </div>
                        <p className="text-xs font-semibold text-indigo-600">{formatCurrency(order.totalAmount)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm py-12">
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Select a customer to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
