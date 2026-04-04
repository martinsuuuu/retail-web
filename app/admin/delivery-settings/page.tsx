'use client';

import { useState, useEffect } from 'react';
import { Truck, ExternalLink, Save, CheckCircle } from 'lucide-react';

export default function DeliverySettingsPage() {
  const [shopeeLink, setShopeeLink] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        setShopeeLink(data.shopee_checkout_link || '');
        setIsLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shopee_checkout_link: shopeeLink }),
    });
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Truck className="h-6 w-6 text-indigo-600" />
          Delivery Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">Configure delivery options shown to customers at checkout</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Shopee Checkout</h2>
        <p className="text-sm text-gray-500 mb-4">
          Customers selecting Shopee Checkout will see this link at checkout. Paste your Shopee product or checkout URL here.
        </p>

        {isLoading ? (
          <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <>
            <div className="flex gap-2">
              <input
                type="url"
                value={shopeeLink}
                onChange={(e) => { setShopeeLink(e.target.value); setSaved(false); }}
                placeholder="https://shopee.ph/..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {shopeeLink && (
                <a
                  href={shopeeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-2 text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Test
                </a>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="mt-4 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {saved ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving…' : 'Save'}
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
