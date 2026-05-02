'use client';

import { useCartStore } from '@/store/cartStore';
import { X, Trash2, ShoppingBag, Trash } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CartDrawer() {
  const { items, isOpen, toggleCart, removeItem, clearCart } = useCartStore();

  const drawerClass = isOpen ? 'translate-x-0' : 'translate-x-full';
  const overlayClass = isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none';

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  // --- SMART DELETE LOGIC ---
  const handleClearCart = () => {
    // Non-tech friendly confirmation
    const confirmed = window.confirm("Your cart is full of goodies! Are you sure you want to remove everything?");
    
    if (confirmed) {
      clearCart();
      toast.error("Cart cleared", {
        description: "Don't leave hungry! Your items have been removed.",
      });
    }
  };

  const handleRemoveItem = (id: string, name: string) => {
    removeItem(id);
    toast.info(`${name} removed from cart`);
  };

  return (
    <>
      {/* Dark Background Overlay */}
      <div 
        onClick={toggleCart}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] transition-opacity duration-300 ${overlayClass}`}
      />

      {/* Slide-out Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[210] shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col ${drawerClass}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-serif font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[var(--color-primary)]" />
            Your Cart
          </h2>
          <button onClick={toggleCart} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 opacity-20" />
              </div>
              <p className="font-bold text-gray-300 uppercase tracking-widest text-xs">Your bag is empty</p>
              <button 
                onClick={toggleCart}
                className="text-[var(--color-primary)] font-bold hover:underline"
              >
                Go find some snacks
              </button>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={index} className="flex gap-4 bg-white p-3 rounded-2xl border border-gray-100 group transition-all hover:border-[var(--color-primary)]/20">
                <div className="w-20 h-20 relative bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                  <Image src={item.image || '/placeholder.png'} alt={item.name} fill unoptimized className="object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="flex-grow flex flex-col justify-center">
                  <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{item.name}</h4>
                  {item.variant && <p className="text-xs text-gray-500 uppercase tracking-tighter font-bold">{item.variant}</p>}
                  <p className="text-sm font-bold text-[var(--color-primary)] mt-1">₹{item.price} <span className="text-gray-400 font-normal ml-1">x {item.quantity}</span></p>
                </div>
                <button 
                  onClick={() => handleRemoveItem(item.id, item.name)} 
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl self-center transition-all"
                  title="Remove Item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout */}
        {items.length > 0 && (
          <div className="p-8 border-t border-gray-100 bg-white">
            <div className="flex justify-between items-end mb-8">
              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em]">Subtotal</span>
                <p className="text-3xl font-serif font-bold text-gray-900">₹{subtotal}</p>
              </div>
              
              {/* CLEAR CART BUTTON */}
              <button 
                onClick={handleClearCart}
                className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-600 transition-colors uppercase tracking-widest pb-1"
              >
                <Trash className="w-3.5 h-3.5" />
                Clear All
              </button>
            </div>

            <Link 
              href="/checkout" 
              onClick={toggleCart}
              className="w-full block text-center bg-gray-900 text-white py-5 rounded-[1.5rem] font-bold text-lg hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95"
            >
              Proceed to Checkout
            </Link>
            
            <p className="text-center text-[10px] text-gray-400 mt-6 font-bold uppercase tracking-[0.2em]">
              Secure payment via Razorpay
            </p>
          </div>
        )}
      </div>
    </>
  );
}