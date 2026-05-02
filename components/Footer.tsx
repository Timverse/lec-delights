'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

export default function Footer() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('logo_url')
          .eq('id', 'global_config')
          .single();
        
        if (data?.logo_url) setLogoUrl(data.logo_url);
      } catch (error) {
        console.error("Error fetching logo for footer:", error);
      }
    };
    fetchLogo();
  }, []);

  return (
    <footer className="bg-[#111111] text-gray-400 pt-20 pb-8 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8 mb-16">
          
          {/* --- Logo Column --- */}
          <div className="flex flex-col items-start">
            {/* The Container: Added 'overflow-visible' and removed padding.
               The Image: Using 'object-cover' and rounded-full ensures the 
               logo fills the entire circle background perfectly.
            */}
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl relative">
              {logoUrl ? (
                <Image 
                  src={logoUrl} 
                  alt="Lec Delights" 
                  fill 
                  className="object-cover rounded-full" 
                  unoptimized
                />
              ) : (
                <span className="text-[var(--color-primary)] font-bold font-serif text-4xl">GF</span>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-serif font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li><Link href="/account" className="hover:text-white transition-colors block py-1">My account</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors block py-1">Shop</Link></li>
            </ul>
          </div>

          {/* Site Links */}
          <div>
            <h3 className="text-white font-serif font-bold text-lg mb-6">Site Links</h3>
            <ul className="space-y-4">
              <li><Link href="/about" className="hover:text-white transition-colors block py-1">About</Link></li>
              <li><Link href="/terms-and-conditions" className="hover:text-white transition-colors block py-1">Terms and Conditions</Link></li>
              <li><Link href="/terms-and-conditions#shipping" className="hover:text-white transition-colors block py-1">Shipping Policy</Link></li>
              <li><Link href="/terms-and-conditions#returns" className="hover:text-white transition-colors block py-1">Return and Refund Policy</Link></li>
              <li><Link href="/terms-and-conditions#privacy" className="hover:text-white transition-colors block py-1">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Our Address */}
          <div>
            <h3 className="text-white font-serif font-bold text-lg mb-6">Our Address</h3>
            <address className="not-italic leading-relaxed space-y-1 text-sm sm:text-base text-gray-400">
              <p>Lec Delights,</p>
              <p>Mission Compound,</p>
              <p>West Jaintia Hills,</p>
              <p>Jowai</p>
              <p>Meghalaya - 793150</p>
            </address>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
          <p className="text-center md:text-left text-gray-500">Copyright © 2026 | Lec Delights</p>
        </div>
      </div>
    </footer>
  );
}