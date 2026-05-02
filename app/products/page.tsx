import Link from 'next/link';
import Image from 'next/image';
import { Plus, ShoppingBag } from 'lucide-react';
import { supabase } from '@/lib/supabase';


export const revalidate = 0; 

export default async function ProductsPage() {
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="bg-[#fafaf9] min-h-screen pt-40 pb-32">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Modern Header Section */}
        <div className="mb-20 text-center space-y-4">
          <div className="flex items-center justify-center gap-3 text-[var(--color-primary)] font-bold text-xs tracking-[0.3em] uppercase mb-4">
            <span className="w-12 h-[1px] bg-[var(--color-primary)]"></span>
            Authentic Flavors
            <span className="w-12 h-[1px] bg-[var(--color-primary)]"></span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 leading-tight">
            Our Collection
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-sans leading-relaxed">
            Handcrafted snacks and delicacies sourced directly from the pristine hills of Meghalaya.
          </p>
        </div>

        {/* The Grid: 3 columns with high breathing room */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {products?.map((product) => (
            <div 
              key={product.id} 
              className="group relative flex flex-col bg-white p-5 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-gray-200/50 border border-gray-50"
            >
              
              {/* Image Container with Hover Action */}
              <Link href={`/product/${product.id}`} className="relative aspect-[4/5] bg-[#fafaf9] rounded-[2rem] overflow-hidden mb-8 block cursor-pointer shadow-inner">
                {product.old_price && (
                  <span className="absolute top-5 left-5 bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-black px-4 py-1.5 rounded-full z-10 shadow-sm uppercase tracking-widest border border-white">
                    Special Offer
                  </span>
                )}
                
                <Image 
                  src={product.image_urls?.[0] || '/placeholder.png'} 
                  alt={product.name} 
                  fill 
                  unoptimized
                  className="object-cover transition-transform duration-700 group-hover:scale-110" 
                />

                {/* Quick Action Button: Modern Hover Interaction */}
                <div className="absolute bottom-6 right-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <div className="bg-white/90 backdrop-blur-md p-4 rounded-full shadow-xl border border-white text-[var(--color-primary)]">
                    <Plus className="w-6 h-6" />
                  </div>
                </div>
              </Link>
              
              {/* Product Info with Premium Typography */}
              <div className="px-3 pb-2 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-serif font-bold text-2xl text-gray-900 leading-tight group-hover:text-[var(--color-primary)] transition-colors">
                    {product.name}
                  </h3>
                </div>
                
                <div className="flex gap-3 items-center mb-8 font-sans">
                  <span className="font-bold text-[var(--color-primary)] text-2xl">₹{product.price}</span>
                  {product.old_price && (
                    <span className="text-gray-300 line-through text-sm">₹{product.old_price}</span>
                  )}
                </div>
                
                {/* Modern CTA Button */}
                <Link 
                  href={`/product/${product.id}`} 
                  className="mt-auto flex items-center justify-center gap-2 bg-gray-900 text-white text-center py-5 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Select Options
                </Link>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {products?.length === 0 && (
            <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-gray-200" />
              </div>
              <p className="text-gray-400 font-serif text-2xl italic">Our kitchen is preparing something new...</p>
              <p className="text-gray-400 text-sm mt-2">Check back shortly for fresh snacks!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}