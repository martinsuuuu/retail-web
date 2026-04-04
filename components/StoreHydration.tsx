'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/lib/cartStore';

export default function StoreHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);
  return null;
}
