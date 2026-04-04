'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Truck, Package, CheckCircle, Clock } from 'lucide-react';

interface PurchaseOrder {
  id: string;
  supplier: string;
  status: string;
  totalCost: number;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    unitCost: number;
    product: {
      id: string;
      name: string;
      stock: number;
    };
  }>;
}

export default function AdminPurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReceiving, setIsReceiving] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/purchase-orders')
      .then(res => res.json())
      .then(data => {
        setPurchaseOrders(data);
        setIsLoading(false);
      });
  }, []);

  const handleReceive = async (id: string) => {
    if (!confirm('Mark this purchase order as received? This will update inventory.')) return;
    setIsReceiving(id);
    const res = await fetch(`/api/admin/purchase-orders/${id}/receive`, {
      method: 'POST',
    });
    if (res.ok) {
      const updated = await res.json();
      setPurchaseOrders(prev => prev.map(po => po.id === id ? updated : po));
    }
    setIsReceiving(null);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Manage supplier orders and inventory restocking</p>
        </div>
        <Link href="/admin/purchase-orders/new" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Purchase Order
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-xl animate-pulse" />
          ))}
        </div>
      ) : purchaseOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Truck className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-700 mb-2">No purchase orders yet</h3>
          <p className="text-gray-500 text-sm mb-4">Create a purchase order to restock inventory</p>
          <Link href="/admin/purchase-orders/new" className="btn-primary">
            Create Purchase Order
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {purchaseOrders.map((po) => (
            <div key={po.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <Truck className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{po.supplier}</h3>
                    <p className="text-xs text-gray-500">PO #{po.id.slice(-8).toUpperCase()} · {formatDate(po.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge text-xs ${
                    po.status === 'RECEIVED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {po.status === 'RECEIVED' ? (
                      <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Received</span>
                    ) : (
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</span>
                    )}
                  </span>
                  {po.status !== 'RECEIVED' && (
                    <button
                      onClick={() => handleReceive(po.id)}
                      disabled={isReceiving === po.id}
                      className="btn-success text-sm py-1.5 px-3 flex items-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      {isReceiving === po.id ? 'Processing...' : 'Mark Received'}
                    </button>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Product</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">Qty</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">Unit Cost</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-gray-500">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {po.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 font-medium text-gray-900">{item.product.name}</td>
                        <td className="px-4 py-2 text-right text-gray-600">{item.quantity}</td>
                        <td className="px-4 py-2 text-right text-gray-600">{formatCurrency(item.unitCost)}</td>
                        <td className="px-4 py-2 text-right font-medium text-gray-900">
                          {formatCurrency(item.quantity * item.unitCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-200">
                      <td colSpan={3} className="px-4 py-2 text-right font-semibold text-gray-700">Total Cost:</td>
                      <td className="px-4 py-2 text-right font-bold text-indigo-600">{formatCurrency(po.totalCost)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
