'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AddToCartButton({ 
  product, 
  selectedVariant, 
  quantity = 1,
  finalPrice 
}: { 
  product: any, 
  selectedVariant?: any, 
  quantity?: number,
  finalPrice: number 
}) {
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const toggleCart = useCartStore((state) => state.toggleCart);

  const handleAddToCart = () => {
    setIsAdding(true);

    const productToAdd = {
      id: product.id,
      name: product.name,
      price: finalPrice, // Uses the exact discounted price
      quantity: quantity,
      image: product.image_urls?.[0] || '/placeholder.png',
      variant: selectedVariant ? selectedVariant.label : undefined, // Correctly handles sizing/weights
    };
    
    addItem(productToAdd);

    // Competitive Feedback: Interactive Toast
    toast.success(`${product.name} added!`, {
      description: selectedVariant 
        ? `${selectedVariant.label} is now in your bag.` 
        : "Check your bag to checkout.",
      action: {
        label: "View Bag",
        onClick: () => toggleCart() // Frictionless transition to checkout
      }
    });

    // Revert button state after 1.5 seconds for reliability
    setTimeout(() => setIsAdding(false), 1500);
  };

  return (
    <button 
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 disabled:cursor-not-allowed ${
        isAdding 
          ? 'bg-green-600 text-white shadow-green-600/20' 
          : 'bg-gray-900 text-white hover:bg-black shadow-gray-900/20'
      }`}
    >
      {isAdding ? (
        <>
          <Check className="w-6 h-6 animate-in zoom-in" />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingCart className="w-6 h-6" />
          Add to Cart
        </>
      )}
    </button>
  );
}