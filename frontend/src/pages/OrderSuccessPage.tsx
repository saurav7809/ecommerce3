// ─── Order Success Page ───────────────────────────────────────────────────────

import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Package } from 'lucide-react';

export default function OrderSuccessPage() {
  const [params] = useSearchParams();
  const reference = params.get('ref');

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
          <CheckCircle size={40} className="text-green-500" />
        </div>
      </div>
      <h1 className="text-2xl font-semibold text-stone-900 mb-2">Order placed!</h1>
      <p className="text-stone-500 text-sm mb-2">
        Thanks for your order. We'll send you a confirmation soon.
      </p>
      {reference && (
        <p className="text-xs text-stone-400 font-mono bg-stone-50 rounded-xl px-4 py-2 inline-block mb-6">
          {reference}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
        <Link
          to="/orders"
          className="flex items-center justify-center gap-2 bg-stone-900 text-white rounded-xl px-6 py-3 text-sm font-medium hover:bg-stone-800 transition-colors"
        >
          <Package size={16} /> View my orders
        </Link>
        <Link
          to="/products"
          className="flex items-center justify-center gap-2 border border-stone-200 text-stone-700 rounded-xl px-6 py-3 text-sm font-medium hover:border-stone-400 transition-colors"
        >
          Keep shopping <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}

