'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Package } from 'lucide-react';

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  items: number;
}

interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  totalExpenses: number;
  netProfit: number;
}

export default function AdminSalesPage() {
  const [period, setPeriod] = useState('monthly');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/admin/sales?period=${period}`)
      .then(res => res.json())
      .then(data => {
        setSalesData(data.salesData);
        setSummary(data.summary);
        setIsLoading(false);
      });
  }, [period]);

  const maxRevenue = salesData.length > 0 ? Math.max(...salesData.map(d => d.revenue)) : 1;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Summary</h1>
          <p className="text-gray-500 text-sm mt-1">Revenue and performance overview</p>
        </div>
        <div className="flex gap-2">
          {['daily', 'weekly', 'monthly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                period === p ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Total Revenue',
              value: formatCurrency(summary.totalRevenue),
              icon: DollarSign,
              color: 'text-green-600',
              bg: 'bg-green-50',
            },
            {
              label: 'Total Orders',
              value: summary.totalOrders.toString(),
              icon: ShoppingBag,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
            },
            {
              label: 'Total Expenses',
              value: formatCurrency(summary.totalExpenses),
              icon: TrendingUp,
              color: 'text-red-600',
              bg: 'bg-red-50',
            },
            {
              label: 'Net Profit',
              value: formatCurrency(summary.netProfit),
              icon: BarChart3,
              color: summary.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600',
              bg: summary.netProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50',
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Bar Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          Revenue Chart ({period.charAt(0).toUpperCase() + period.slice(1)})
        </h2>

        {isLoading ? (
          <div className="flex items-end gap-2 h-48">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex-1 bg-gray-200 rounded-t animate-pulse" style={{ height: `${Math.random() * 80 + 20}%` }} />
            ))}
          </div>
        ) : salesData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No sales data for this period</p>
            </div>
          </div>
        ) : (
          <div className="flex items-end gap-1 h-48 overflow-x-auto">
            {salesData.map((data, index) => {
              const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={index} className="flex flex-col items-center gap-1 flex-1 min-w-12 group relative">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-2 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <p className="font-medium">{data.date}</p>
                    <p>Revenue: {formatCurrency(data.revenue)}</p>
                    <p>Orders: {data.orders}</p>
                  </div>
                  <div
                    className="w-full bg-indigo-500 hover:bg-indigo-600 rounded-t transition-all cursor-pointer"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                  <p className="text-xs text-gray-400 w-full text-center truncate">{data.date}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Sales Breakdown</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Period</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Orders</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Items Sold</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Revenue</th>
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
            ) : salesData.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm">
                  No sales data for this period
                </td>
              </tr>
            ) : (
              [...salesData].reverse().map((data, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-sm text-gray-900">{data.date}</td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">{data.orders}</td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">{data.items}</td>
                  <td className="px-6 py-4 text-right font-bold text-sm text-indigo-600">
                    {formatCurrency(data.revenue)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {!isLoading && salesData.length > 0 && summary && (
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td className="px-6 py-3 font-semibold text-sm text-gray-700">Total</td>
                <td className="px-6 py-3 text-right font-semibold text-sm text-gray-700">{summary.totalOrders}</td>
                <td className="px-6 py-3 text-right font-semibold text-sm text-gray-700">
                  {salesData.reduce((sum, d) => sum + d.items, 0)}
                </td>
                <td className="px-6 py-3 text-right font-bold text-sm text-indigo-700">
                  {formatCurrency(summary.totalRevenue)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
