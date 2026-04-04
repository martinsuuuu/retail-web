'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/lib/cartStore';
import { useSession } from 'next-auth/react';
import { toast } from '@/lib/toast';
import AddToCartModal from '@/components/AddToCartModal';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  reserved: number;
  category: string | null;
  imageUrl: string | null;
}

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const availableStock = product.stock - product.reserved;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session) {
      window.location.href = '/login';
      return;
    }
    if (availableStock <= 0) return;
    setShowModal(true);
  };

  const handleConfirm = (quantity: number) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: product.imageUrl,
      stock: availableStock,
    });
    toast.success(`${product.name} added to cart!`);
    setShowModal(false);
  };

  return (
    <>
    {showModal && (
      <AddToCartModal
        product={{ name: product.name, price: product.price, availableStock }}
        onConfirm={handleConfirm}
        onClose={() => setShowModal(false)}
      />
    )}
    <Link href={`/shop/${product.id}`} className="group flex h-full">
      <div className="flex flex-col w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
        {/* Product Image — fixed height */}
        <div className="relative h-48 flex-shrink-0 bg-gray-100">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-12 w-12 text-gray-300" />
            </div>
          )}
          {product.category && (
            <span className="absolute top-2 left-2 bg-white/90 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {product.category}
            </span>
          )}
          {availableStock <= 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-red-500 text-white text-sm font-medium px-3 py-1 rounded-full">Out of Stock</span>
            </div>
          )}
          {availableStock > 0 && availableStock < 5 && (
            <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
              Only {availableStock} left!
            </span>
          )}
        </div>

        {/* Product Info — fills remaining height */}
        <div className="flex flex-col flex-1 p-4">
          {/* Name: always reserves 2 lines */}
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 min-h-[2.5rem] group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
          {/* Description: always reserves 2 lines */}
          <p className="text-xs text-gray-500 mt-1 line-clamp-2 min-h-[2rem]">
            {product.description ?? ''}
          </p>
          {/* Price + button pinned to bottom */}
          <div className="flex items-center justify-between mt-auto pt-3">
            <span className="text-lg font-bold text-indigo-600">{formatCurrency(product.price)}</span>
            <button
              onClick={handleAddToCart}
              disabled={availableStock <= 0}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <ShoppingCart className="h-3 w-3" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </Link>
    </>
  );
}
