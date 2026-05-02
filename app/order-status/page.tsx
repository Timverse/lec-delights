'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Package, Truck, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function OrderStatusPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('id', params.id)
        .single();
      setOrder(data);
      setLoading(false);
    };
    fetchOrder();
  }, [params.id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center italic text-gray-400">Verifying Order...</div>;

  return (
    <div className="bg-[#fafaf9] min-h-screen pt-40 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-xl shadow-gray-200/50 text-center border border-gray-50">
          <div className="w-20 h-20 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10 text-[var(--color-primary)]" />
          </div>
          
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">Snacks Secured!</h1>
          <p className="text-gray-500 mb-10">Order <span className="font-bold text-gray-800">#{params.id.slice(0, 8).toUpperCase()}</span> is being prepared with love in Jowai.</p>

          {/* Simple Progress Tracker */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center"><Clock className="w-5 h-5" /></div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Received</span>
            </div>
            <div className="flex flex-col items-center gap-2 opacity-30">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"><Package className="w-5 h-5" /></div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Packing</span>
            </div>
            <div className="flex flex-col items-center gap-2 opacity-30">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"><Truck className="w-5 h-5" /></div>
              <span className="text-[10px] font-bold uppercase tracking-widest">On the Way</span>
            </div>
          </div>

          <Link href="/products" className="inline-flex items-center gap-2 bg-gray-900 text-white px-10 py-4 rounded-full font-bold hover:bg-black transition-all">
            Continue Shopping <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}