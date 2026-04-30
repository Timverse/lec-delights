import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 0; 

const supabaseUrl = 'https://vyqwkijpuehlqwkspdwc.supabase.co';
const supabaseKey = 'sb_publishable_dx3ou74Ln8ygmQ6bPHdNvw_v4tuuRfo';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function ProductsPage() {
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="bg-[#fafaf9] min-h-screen pt-36 pb-24">
      <div className="max-w-7xl mx-auto px-6 text-center">
        
        <div className="mb-16">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-[var(--color-foreground)] mb-4">
            Shop All Products
          </h1>
          <div className="w-24 h-1 bg-[var(--color-primary)] mx-auto mb-6 rounded-full"></div>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Browse our complete collection of 100% natural, farm-fresh products sourced directly from local growers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {products?.map((product) => (
            <div key={product.id} className="group flex flex-col bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
              
              {/* FIX: This entire block is now a Link! */}
              <Link href={`/product/${product.id}`} className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-6 block cursor-pointer">
                {product.old_price && (
                  <span className="absolute top-4 right-4 bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded-full z-10 shadow-sm border border-gray-100">
                    Sale!
                  </span>
                )}
                <Image 
                  src={product.image_urls?.[0] || '/placeholder.png'} 
                  alt={product.name} 
                  fill 
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </Link>
              
              <h3 className="font-serif font-bold text-2xl text-[var(--color-foreground)] mb-2">
                {product.name}
              </h3>
              
              <div className="flex gap-3 items-center mb-6">
                {product.old_price && (
                  <span className="text-gray-400 line-through font-medium">₹{product.old_price}</span>
                )}
                <span className="font-bold text-[var(--color-foreground)] text-xl">₹{product.price}</span>
              </div>
              
              <Link 
                href={`/product/${product.id}`} 
                className="mt-auto bg-[var(--color-primary)] text-white text-center py-4 rounded-2xl font-bold hover:bg-[#7fae45] transition-colors shadow-md shadow-[var(--color-primary)]/20"
              >
                Select options
              </Link>
            </div>
          ))}

          {products?.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-gray-500 text-xl">No products found. Please check back later!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}