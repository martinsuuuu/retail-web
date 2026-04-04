'use client';

import { useState, useEffect } from 'react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Truck, Package, CheckCircle, MapPin, User, Clock } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  deliveryMethod: string;
  totalAmount: number;
  shippedAt: string | null;
  createdAt: string;
  user: {
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
      category: string | null;
    };
  }>;
}

export default function ShipperPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shippingId, setShippingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('CONFIRMED');

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setIsLoading(false);
      });
  }, []);

  const handleMarkShipped = async (orderId: string) => {
    if (!confirm('Mark this order as shipped?')) return;
    setShippingId(orderId);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'SHIPPED' }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));
    }
    setShippingId(null);
  };

  const filtered = orders.filter(o => o.status === filter);

  const confirmedCount = orders.filter(o => o.status === 'CONFIRMED').length;
  const shippedCount = orders.filter(o => o.status === 'SHIPPED').length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Shipper Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage and process outgoing orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{confirmedCount}</p>
              <p className="text-sm text-gray-500">Ready to Ship</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Truck className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{shippedCount}</p>
              <p className="text-sm text-gray-500">Shipped</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('CONFIRMED')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'CONFIRMED' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Ready to Ship ({confirmedCount})
        </button>
        <button
          onClick={() => setFilter('SHIPPED')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'SHIPPED' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Shipped ({shippedCount})
        </button>
      </div>

      {/* Orders */}
      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Truck className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-700 mb-2">
            {filter === 'CONFIRMED' ? 'No orders ready to ship' : 'No shipped orders yet'}
          </h3>
          <p className="text-gray-500 text-sm">
            {filter === 'CONFIRMED' ? 'Confirmed orders will appear here' : 'Shipped orders will appear here'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Order header */}
              <div className={`px-5 py-3 ${order.status === 'SHIPPED' ? 'bg-indigo-600' : 'bg-green-600'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-white font-mono font-bold text-sm">
                    #{order.id.slice(-8).toUpperCase()}
                  </span>
                  <span className="bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    {order.status === 'SHIPPED' ? 'Shipped' : 'Ready to Ship'}
                  </span>
                </div>
              </div>

              <div className="p-5">
                {/* Customer info */}
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.user.name}</p>
                    <p className="text-xs text-gray-500">{order.user.email}</p>
                  </div>
                </div>

                {/* Delivery info */}
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-4 w-4 text-indigo-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-900">{order.deliveryMethod}</span>
                    <span className="text-xs text-gray-500 ml-2">Delivery</span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-3 w-3 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-xs font-semibold text-gray-700">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-4 pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-500">Total</span>
                  <span className="font-bold text-indigo-600">{formatCurrency(order.totalAmount)}</span>
                </div>

                {order.status === 'CONFIRMED' ? (
                  <button
                    onClick={() => handleMarkShipped(order.id)}
                    disabled={shippingId === order.id}
                    className="w-full btn-primary flex items-center justify-center gap-2 py-2.5"
                  >
                    <Truck className="h-4 w-4" />
                    {shippingId === order.id ? 'Processing...' : 'Mark as Shipped'}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg text-sm text-indigo-700">
                    <CheckCircle className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Shipped</p>
                      {order.shippedAt && (
                        <p className="text-xs text-indigo-500">{formatDateTime(order.shippedAt)}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
