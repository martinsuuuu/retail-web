'use client';

import { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface AddToCartModalProps {
  product: {
    name: string;
    price: number;
    availableStock: number;
  };
  onConfirm: (quantity: number) => void;
  onClose: () => void;
}

export default function AddToCartModal({ product, onConfirm, onClose }: AddToCartModalProps) {
  const [quantity, setQuantity] = useState(1);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const isValid = quantity >= 1 && quantity <= product.availableStock;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 leading-snug">{product.name}</h2>
            <p className="text-indigo-600 font-bold text-xl mt-1">{formatCurrency(product.price)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Stock info */}
        <p className="text-xs text-gray-500 mb-4">
          {product.availableStock} unit{product.availableStock !== 1 ? 's' : ''} available
        </p>

        {/* Quantity selector */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 mb-6">
          <span className="text-sm font-medium text-gray-700">Quantity</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-8 text-center text-lg font-semibold text-gray-900">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(product.availableStock, q + 1))}
              disabled={quantity >= product.availableStock}
              className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Subtotal */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
          <span>Subtotal</span>
          <span className="font-semibold text-gray-900">{formatCurrency(product.price * quantity)}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { if (isValid) onConfirm(quantity); }}
            disabled={!isValid}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
