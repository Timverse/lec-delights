'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '../store/cartStore';

export default function ProductCard({ product }: { product: any }) {
  const addToCart = useCartStore((state: any) => state.addToCart);

  return (
    <article className="bg-white rounded-[2rem] p-6 hover-lift border border-gray-100/50 flex flex-col relative group">
      
      {/* Wrapped Image in a Link */}
      <Link href={`/product/${product.id}`} className="block relative w-full h-72 mb-6 bg-[var(--color-background)] rounded-3xl overflow-hidden flex items-center justify-center">
        {product.old_price && (
          <span className="absolute top-4 right-4 bg-white text-[var(--color-foreground)] text-xs font-bold px-4 py-2 rounded-full shadow-sm z-10 border border-gray-100">
            Sale
          </span>
        )}
        <Image
          src={product.image_url || '/placeholder.png'}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>
      
      {/* Wrapped Title in a Link */}
      <Link href={`/product/${product.id}`}>
        <h3 className="font-serif font-semibold text-2xl mb-2 text-[var(--color-foreground)] hover:text-[var(--color-primary)] transition-colors">
          {product.name}
        </h3>
      </Link>
      
      <div className="flex items-center gap-3 mb-8 mt-auto">
        <span className="font-bold text-xl text-[var(--color-foreground)]">₹{product.price}</span>
        {product.old_price && (
          <span className="text-sm line-through text-gray-400">₹{product.old_price}</span>
        )}
      </div>
      
      <button 
        onClick={() => addToCart(product)}
        className="w-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors py-4 rounded-2xl font-semibold text-sm tracking-wide cursor-pointer active:scale-95"
      >
        Add to Cart
      </button>
    </article>
  );
}