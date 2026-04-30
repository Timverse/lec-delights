import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import Image from 'next/image';
import HeroSlider from '@/components/HeroSlider';

// Bypass cache to always show the freshest products and cards
export const revalidate = 0; 

const supabaseUrl = 'https://vyqwkijpuehlqwkspdwc.supabase.co';
const supabaseKey = 'sb_publishable_dx3ou74Ln8ygmQ6bPHdNvw_v4tuuRfo';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function Home() {
  // Fetch ALL the data we need from Supabase
  const { data: heroImages } = await supabase.from('hero_images').select('*').order('created_at', { ascending: true });
  
  // Fetch all products (we need them for the grid AND to link the feature cards)
  const { data: products } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  
  // Fetch our new Bento Grid feature cards (Sorted by display order)
  const { data: featureCards } = await supabase.from('feature_cards').select('*').order('display_order', { ascending: true });

  // Create a product lookup map (product_id -> Product) so we can easily find the product linked to the bento card button
  const productLookup = products ? new Map(products.map(p => [p.id, p])) : new Map();

  return (
    <div className="w-full bg-white">
      
      {/* 1. HERO SECTION */}
      <section className="pt-32 pb-16 px-6 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center gap-12 min-h-[85vh]">
        {/* Left Text */}
        <div className="w-full md:w-1/2 space-y-8 z-10 relative">
          <div className="mt-12 flex items-center gap-3 text-[var(--color-primary)] font-bold text-sm tracking-[0.2em] uppercase">
            <span className="w-12 h-[2px] bg-[var(--color-primary)]"></span>
            Zero Added Perservatives
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-[var(--color-foreground)] leading-[1.1]">
            Food products <br />
            <span className="text-[var(--color-primary)]">homemade</span><br />
            straight from Jowai, Meghalaya
          </h1>
          <p className="text-gray-600 text-lg max-w-md leading-relaxed">
            Lec Delights
          </p>
          <div className="pt-4">
            <Link 
              href="/products" 
              className="inline-block bg-[var(--color-primary)] text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-[var(--color-primary)]/20 hover:bg-[#7fae45] transition-all hover:scale-105 active:scale-95"
            >
              Shop Now
            </Link>
          </div>
        </div>

        {/* Right Side: Dynamic Hero Slider */}
        <div className="w-full md:w-1/2 relative flex justify-center items-center">
          <div className="absolute inset-0 bg-[var(--color-primary)]/5 rounded-full blur-3xl scale-110"></div>
          <div className="relative w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] md:w-[600px] md:h-[600px] z-10">
            <HeroSlider images={heroImages || []} />
          </div>
        </div>
      </section>

      {/* 2. OUR PRODUCTS SECTION */}
      <section className="bg-[#fafaf9] py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-serif font-bold text-[var(--color-foreground)] mb-2">Our Products</h2>
          <div className="text-[var(--color-primary)] text-3xl mb-12 flex justify-center"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* We slice(0,3) here so we only show the 3 newest products on the home page */}
            {products?.slice(0, 3).map((product) => (
              <div key={product.id} className="group flex flex-col bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                
                {/* --- FIX APPLIED HERE: Changed div to Link --- */}
                <Link 
                  href={`/product/${product.id}`} 
                  className="block relative aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-6 cursor-pointer"
                >
                  {product.old_price && <span className="absolute top-4 right-4 bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded-full z-10 shadow-sm border border-gray-100">Sale!</span>}
                  
                  {/* UNOPTIMIZED ADDED HERE */}
                  <Image 
                    src={product.image_urls?.[0] || '/placeholder.png'} 
                    alt={product.name} 
                    fill 
                    unoptimized 
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </Link>
                
                <h3 className="font-serif font-bold text-xl text-[var(--color-foreground)] mb-2">{product.name}</h3>
                <div className="flex gap-3 items-center mb-6">
                  {product.old_price && <span className="text-gray-400 line-through font-medium">₹{product.old_price}</span>}
                  <span className="font-bold text-[var(--color-foreground)] text-lg">₹{product.price}</span>
                </div>
                <Link href={`/product/${product.id}`} className="mt-auto bg-[var(--color-primary)] text-white text-center py-3 rounded-full font-bold shadow-md shadow-[var(--color-primary)]/20 hover:bg-[#7fae45] transition-colors">Select options</Link>
              </div>
            ))}
          </div>
          
          <div className="mt-12">
             <Link href="/products" className="text-[var(--color-primary)] font-bold text-lg hover:underline underline-offset-4">
               View All Products →
             </Link>
          </div>
        </div>
      </section>

      {/* 3. NEW DYNAMIC BENTO GRID FEATURE CARDS SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {featureCards?.map((card) => {
            // Find the product linked to this card
            const linkedProduct = productLookup.get(card.product_id);
            
            return (
              <div key={card.id} className="group flex flex-col md:flex-row items-start gap-8 bg-[#fafaf9] p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
                
                {/* Image Section - Scale effect preserved */}
                <div className="shrink-0 w-24 h-24 rounded-2xl bg-white flex items-center justify-center p-2 relative overflow-hidden shadow-inner mx-auto md:mx-0">
                  {/* UNOPTIMIZED ADDED HERE */}
                  {card.image_urls?.[0] && (
                    <Image 
                      src={card.image_urls[0]} 
                      alt="" 
                      fill 
                      unoptimized
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-500" 
                    />
                  )}
                </div>
                
                {/* Text & Button Section */}
                <div className="flex-grow space-y-5 text-center md:text-left">
                  <h3 className="text-3xl md:text-4xl font-serif font-bold text-[var(--color-foreground)] leading-tight">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed max-w-lg mx-auto md:mx-0">
                    {card.description}
                  </p>
                  <div className="pt-2">
                    {linkedProduct ? (
                        <Link 
                            href={`/product/${linkedProduct.id}`} 
                            className="inline-block bg-white text-[var(--color-primary)] border border-[var(--color-primary)] px-8 py-3 rounded-full font-bold hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                        >
                            {card.button_text}
                        </Link>
                    ) : (
                        // Fallback in case product ID is broken/deleted
                        <button disabled className="bg-gray-200 text-gray-500 px-8 py-3 rounded-full font-bold cursor-not-allowed">Product Link Broken</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Display this if the admin hasn't added any cards yet */}
          {featureCards?.length === 0 && (
            <div className="col-span-full py-16 text-center text-gray-400 italic bg-[#fafaf9] rounded-[2.5rem] border border-dashed border-gray-200">
              No feature bento grid cards added yet. Head to the Admin Panel to add some!
            </div>
          )}

        </div>
      </section>

    </div>
  );
}