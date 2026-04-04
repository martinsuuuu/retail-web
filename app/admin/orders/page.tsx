'use client';

import { useState, useEffect } from 'react';
import { formatCurrency, formatDateTime, getOrderStatusColor, getOrderStatusLabel } from '@/lib/utils';
import { ShoppingBag, CheckCircle, Search, Filter, Package, Eye } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  deliveryMethod: string;
  totalAmount: number;
  depositProof: string | null;
  depositConfirmed: boolean;
  reservationExpiry: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      imageUrl: string | null;
    };
  }>;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    fetch('/api/orders?all=true')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setIsLoading(false);
      });
  }, []);

  const handleConfirmDeposit = async (orderId: string) => {
    setIsConfirming(true);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ depositConfirmed: true }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));
      setSelectedOrder(prev => prev?.id === orderId ? { ...prev, ...updated } : prev);
    }
    setIsConfirming(false);
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));
      setSelectedOrder(prev => prev?.id === orderId ? { ...prev, ...updated } : prev);
    }
  };

  const filtered = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.user.name.toLowerCase().includes(search.toLowerCase()) ||
      o.user.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'PENDING_DEPOSIT', label: 'Pending Deposit' },
    { value: 'DEPOSIT_SUBMITTED', label: 'Deposit Submitted' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'SHIPPED', label: 'Shipped' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{orders.length} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 input-field"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field py-2"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders list */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No orders found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr
                    key={order.id}
                    className={`hover:bg-gray-50 cursor-pointer ${selectedOrder?.id === order.id ? 'bg-indigo-50' : ''}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono font-medium text-gray-900">#{order.id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(order.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{order.user.name}</p>
                      <p className="text-xs text-gray-500">{order.user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge text-xs ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Order details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {selectedOrder ? (
            <div>
              <div className="mb-4 pb-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Order #{selectedOrder.id.slice(-8).toUpperCase()}</h3>
                <p className="text-xs text-gray-500 mt-1">{formatDateTime(selectedOrder.createdAt)}</p>
                <span className={`badge text-xs mt-2 ${getOrderStatusColor(selectedOrder.status)}`}>
                  {getOrderStatusLabel(selectedOrder.status)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Customer</span>
                  <span className="font-medium">{selectedOrder.user.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery</span>
                  <span className="font-medium">{selectedOrder.deliveryMethod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total</span>
                  <span className="font-bold text-indigo-600">{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              {/* Items */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Items</h4>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span className="text-gray-700 truncate mr-2">{item.product.name} x{item.quantity}</span>
                    <span className="text-gray-600 flex-shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Deposit proof */}
              {selectedOrder.depositProof && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs font-medium text-blue-800 mb-1">Deposit Proof</p>
                  <p className="text-xs text-blue-600">{selectedOrder.depositProof}</p>
                </div>
              )}

              {/* Actions */}
              {selectedOrder.status === 'DEPOSIT_SUBMITTED' && !selectedOrder.depositConfirmed && (
                <button
                  onClick={() => handleConfirmDeposit(selectedOrder.id)}
                  disabled={isConfirming}
                  className="w-full btn-success flex items-center justify-center gap-2 mb-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {isConfirming ? 'Confirming...' : 'Confirm Deposit'}
                </button>
              )}

              {selectedOrder.status === 'CONFIRMED' && (
                <button
                  onClick={() => handleStatusUpdate(selectedOrder.id, 'SHIPPED')}
                  className="w-full btn-primary flex items-center justify-center gap-2 mb-2"
                >
                  Mark as Shipped
                </button>
              )}

              {selectedOrder.status === 'SHIPPED' && (
                <button
                  onClick={() => handleStatusUpdate(selectedOrder.id, 'DELIVERED')}
                  className="w-full btn-success flex items-center justify-center gap-2 mb-2"
                >
                  Mark as Delivered
                </button>
              )}

              {(selectedOrder.status === 'PENDING_DEPOSIT' || selectedOrder.status === 'DEPOSIT_SUBMITTED') && (
                <button
                  onClick={() => handleStatusUpdate(selectedOrder.id, 'CANCELLED')}
                  className="w-full btn-danger flex items-center justify-center gap-2"
                >
                  Cancel Order
                </button>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm py-12">
              <div className="text-center">
                <Eye className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Select an order to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
