'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';

const supabaseUrl = 'https://vyqwkijpuehlqwkspdwc.supabase.co';
const supabaseKey = 'sb_publishable_dx3ou74Ln8ygmQ6bPHdNvw_v4tuuRfo';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  // Connect to Zustand Cart Store
  const cartItems = useCartStore((state: any) => state.items) || [];
  const itemCount = cartItems.reduce((acc: any, item: any) => acc + item.quantity, 0);
  
  const toggleCart = useCartStore((state: any) => state.toggleCart) || (() => console.log('Store missing toggleCart'));

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const fetchLogo = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('logo_url')
          .eq('id', 'global_config')
          .single();
        
        if (data?.logo_url) setLogoUrl(data.logo_url);
      } catch (error) {
        console.error("Error fetching logo:", error);
      }
    };
    fetchLogo();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 backdrop-blur-md border-b border-black/5 ${
        isScrolled ? 'py-3 shadow-md' : 'py-6'
      }`}
      style={{ 
        /* This keeps your EXACT vibrant yellow, but makes it 85-95% solid so it acts like glass without washing out! */
        backgroundColor: isScrolled 
          ? 'color-mix(in srgb, var(--color-primary) 95%, transparent)' 
          : 'color-mix(in srgb, var(--color-primary) 85%, transparent)' 
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-20 h-20 bg-transparent flex items-center justify-center relative overflow-visible transition-transform group-hover:scale-105 duration-300">
            {logoUrl ? (
              <Image src={logoUrl} alt="Lec Delights Logo" fill className="object-contain" unoptimized priority />
            ) : (
              <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center border border-white/40 shadow-sm">
                <span className="text-[var(--color-foreground)] font-bold text-3xl">L</span>
              </div>
            )}
          </div>
          <span className="text-2xl font-sans font-black tracking-tight text-gray-900 uppercase">
            Lec Delights
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          <Link href="/" className="text-sm font-bold text-[var(--color-foreground)] hover:text-white transition-colors tracking-widest uppercase">Home</Link>
          <Link href="/products" className="text-sm font-bold text-[var(--color-foreground)] hover:text-white transition-colors tracking-widest uppercase">All Products</Link>
          <Link href="/about" className="text-sm font-bold text-[var(--color-foreground)] hover:text-white transition-colors tracking-widest uppercase">About</Link>
          <Link href="/contact" className="text-sm font-bold text-[var(--color-foreground)] hover:text-white transition-colors tracking-widest uppercase">Contact</Link>
          <Link href="/account" className="text-sm font-bold text-[var(--color-foreground)] hover:text-white transition-colors tracking-widest uppercase">Account</Link>
          
          <button onClick={toggleCart} className="relative p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer">
            <ShoppingCart className="w-6 h-6 text-[var(--color-foreground)]" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--color-foreground)] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg">
                {itemCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile View Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <button onClick={toggleCart} className="relative p-2 cursor-pointer">
            <ShoppingCart className="w-6 h-6 text-[var(--color-foreground)]" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--color-foreground)] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg">
                {itemCount}
              </span>
            )}
          </button>
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-[var(--color-foreground)]">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-6 space-y-4 shadow-xl">
          <Link href="/" onClick={() => setIsOpen(false)} className="block text-lg font-bold text-[var(--color-foreground)] hover:text-[var(--color-primary)]">Home</Link>
          <Link href="/products" onClick={() => setIsOpen(false)} className="block text-lg font-bold text-[var(--color-foreground)] hover:text-[var(--color-primary)]">All Products</Link>
          <Link href="/about" onClick={() => setIsOpen(false)} className="block text-lg font-bold text-[var(--color-foreground)] hover:text-[var(--color-primary)]">About</Link>
          <Link href="/contact" onClick={() => setIsOpen(false)} className="block text-lg font-bold text-[var(--color-foreground)] hover:text-[var(--color-primary)]">Contact</Link>
          <Link href="/account" onClick={() => setIsOpen(false)} className="block text-lg font-bold text-[var(--color-foreground)] hover:text-[var(--color-primary)]">Account</Link>
        </div>
      )}
    </nav>
  );
}