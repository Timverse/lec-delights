'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart, Check } from 'lucide-react';

export default function AddToCartButton({ 
  product, 
  selectedVariant, 
  quantity = 1,
  finalPrice // NEW: We pass the exact discounted price into the button
}: { 
  product: any, 
  selectedVariant?: any, 
  quantity?: number,
  finalPrice: number 
}) {
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const toggleCart = useCartStore((state) => state.toggleCart);

  const handleAddToCart = () => {
    const productToAdd = {
      id: product.id,
      name: product.name,
      price: finalPrice, // FIX: The cart now uses the discounted price!
      quantity: quantity,
      image: product.image_urls?.[0] || '/placeholder.png',
      variant: selectedVariant ? selectedVariant.label : undefined,
    };
    
    addItem(productToAdd);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
    toggleCart();
  };

  return (
    <button 
      onClick={handleAddToCart}
      disabled={isAdded}
      className={`w-full py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
        isAdded 
          ? 'bg-green-500 text-white shadow-green-500/20' 
          : 'bg-[var(--color-primary)] text-white hover:bg-[#7fae45] shadow-[var(--color-primary)]/20'
      }`}
    >
      {isAdded ? (
        <>
          <Check className="w-5 h-5" />
          Added to Cart!
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5" />
          Add to Cart
        </>
      )}
    </button>
  );
}