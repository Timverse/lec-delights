'use client';

import Link from 'next/link';
import Image from 'next/image';
import HeroSlider from '@/components/HeroSlider';
import TrustBar from '@/components/TrustBar'; 
import { createClient } from '@supabase/supabase-js';

// --- VERCEL FIX: Safer Supabase Initialization ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Bypass cache to always show the freshest products and cards
export const revalidate = 0; 

export default async function Home() {
  const { data: heroImages } = await supabase.from('hero_images').select('*').order('created_at', { ascending: true });
  const { data: products } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  const { data: featureCards } = await supabase.from('feature_cards').select('*').order('display_order', { ascending: true });

  // --- NEW: Fetch exact products from the new_arrivals slots ---
  const { data: arrivalsData } = await supabase
    .from('new_arrivals')
    .select(`
      slot_number,
      products (*)
    `)
    .order('slot_number', { ascending: true });

  // Extract the valid product objects, ignoring any empty slots
  const newArrivals = arrivalsData
    ?.map(slot => slot.products)
    .filter(product => product !== null) || [];

  const productLookup = products ? new Map(products.map(p => [p.id, p])) : new Map();

  return (
    <div className="w-full bg-[#fafaf9]">
      
      {/* 1. HERO SECTION */}
      <section className="pt-40 pb-24 px-6 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center gap-16 min-h-[90vh]">
        {/* Left Text */}
        <div className="w-full md:w-1/2 space-y-10 z-10 relative">
          <div className="flex items-center gap-4 text-[var(--color-primary)] font-bold text-xs tracking-[0.3em] uppercase">
            <span className="w-16 h-[1.5px] bg-[var(--color-primary)]"></span>
            Zero Added Preservatives
          </div>
          
          <h1 className="text-6xl md:text-8xl font-serif font-bold text-gray-900 leading-[1.05] tracking-tight">
            Food products <br />
            <span className="text-[var(--color-primary)] italic">homemade</span><br />
            from Meghalaya
          </h1>
          
          <p className="text-gray-500 text-xl font-sans max-w-md leading-relaxed">
            Authentic home-style delicacies crafted with love in the heart of Jowai.
          </p>
          
          <div className="pt-6">
            <Link 
              href="/products" 
              className="inline-block bg-[var(--color-primary)] text-white px-12 py-5 rounded-full font-bold text-lg shadow-2xl shadow-[var(--color-primary)]/30 hover:bg-[#7fae45] transition-all hover:-translate-y-1 active:scale-95"
            >
              Shop Collection
            </Link>
          </div>
        </div>

        {/* Right Side: Hero Slider */}
        <div className="w-full md:w-1/2 relative flex justify-center items-center">
          <div className="absolute inset-0 bg-[var(--color-primary)]/10 rounded-full blur-[100px] scale-125"></div>
          <div className="relative w-full aspect-square max-w-[600px] z-10">
            <HeroSlider images={heroImages || []} />
          </div>
        </div>
      </section>

      {/* 2. TRUST BAR */}
      <TrustBar />

      {/* 3. OUR PRODUCTS SECTION */}
      <section className="bg-white py-26 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-serif font-bold text-gray-900 mb-4">New Arrivals</h2>
          <p className="text-gray-400 font-sans tracking-widest uppercase text-xs mb-16">Fresh from our kitchen to your doorstep</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
            {newArrivals.map((product: any) => (
              <div key={product.id} className="group flex flex-col bg-white rounded-[2rem] transition-all duration-500">
                
                <Link 
                  href={`/product/${product.id}`} 
                  className="block relative aspect-[4/5] bg-[#fafaf9] rounded-[2.5rem] overflow-hidden mb-8 shadow-sm group-hover:shadow-xl transition-all duration-500"
                >
                  {product.old_price && (
                    <span className="absolute top-6 left-6 bg-white/90 backdrop-blur-md text-gray-900 text-xs font-black px-4 py-1.5 rounded-full z-10 shadow-sm uppercase tracking-tighter">
                      Save ₹{product.old_price - product.price}
                    </span>
                  )}
                  
                  <Image 
                    src={product.image_urls?.[0] || '/placeholder.png'} 
                    alt={product.name} 
                    fill 
                    unoptimized 
                    className="object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                </Link>
                
                <div className="px-2">
                    <h3 className="font-serif font-bold text-2xl text-gray-900 mb-2">{product.name}</h3>
                    <div className="flex gap-3 items-center mb-6 font-sans">
                      {product.old_price && <span className="text-gray-300 line-through text-base">₹{product.old_price}</span>}
                      <span className="font-bold text-[var(--color-primary)] text-xl">₹{product.price}</span>
                    </div>
                    <Link href={`/product/${product.id}`} className="inline-flex items-center font-bold text-sm uppercase tracking-widest text-gray-900 hover:text-[var(--color-primary)] transition-colors group-hover:translate-x-2 transition-transform">
                      View Details —
                    </Link>
                </div>
              </div>
            ))}
            
            {newArrivals.length === 0 && (
              <p className="col-span-3 text-center text-gray-400 italic py-10">
                Check back soon for new treats!
              </p>
            )}
          </div>
          
          <div className="mt-20">
             <Link href="/products" className="bg-gray-900 text-white px-10 py-4 rounded-full font-bold hover:bg-black transition-all">
               Browse All Products
             </Link>
          </div>
        </div>
      </section>

      {/* 4. BENTO GRID FEATURE CARDS */}
      <section className="max-w-7xl mx-auto px-6 py-26 pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {featureCards?.map((card) => {
            const linkedProduct = productLookup.get(card.product_id);
            
            return (
              <div key={card.id} className="group flex flex-col md:flex-row items-center gap-10 bg-white p-10 md:p-14 rounded-[3rem] border border-gray-50 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500">
                
                <div className="shrink-0 w-32 h-32 rounded-[2rem] bg-[#fafaf9] flex items-center justify-center p-4 relative overflow-hidden shadow-inner">
                  {card.image_urls?.[0] && (
                    <Image 
                      src={card.image_urls[0]} 
                      alt="" 
                      fill 
                      unoptimized
                      className="object-contain p-4 group-hover:rotate-12 transition-transform duration-500" 
                    />
                  )}
                </div>
                
                <div className="flex-grow space-y-6 text-center md:text-left">
                  <h3 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 leading-tight">
                    {card.title}
                  </h3>
                  <p className="text-gray-500 font-sans leading-relaxed text-base">
                    {card.description}
                  </p>
                  <div className="pt-2">
                    {linkedProduct ? (
                        <Link 
                            href={`/product/${linkedProduct.id}`} 
                            className="inline-block bg-[var(--color-primary)] text-white px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-widest shadow-lg shadow-[var(--color-primary)]/20 hover:brightness-110 transition-all"
                        >
                            {card.button_text}
                        </Link>
                    ) : (
                        <button disabled className="bg-gray-100 text-gray-400 px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest cursor-not-allowed italic">Out of Stock</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}