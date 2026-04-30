'use client';

import { useCartStore } from '@/store/cartStore';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CartDrawer() {
  const { items, isOpen, toggleCart, removeItem } = useCartStore();

  // If the drawer isn't open, we push it off-screen
  const drawerClass = isOpen ? 'translate-x-0' : 'translate-x-full';
  const overlayClass = isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none';

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

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
              <ShoppingBag className="w-16 h-16 opacity-20" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={index} className="flex gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <div className="w-20 h-20 relative bg-white rounded-xl overflow-hidden shrink-0 border border-gray-100">
                  <Image src={item.image || '/placeholder.png'} alt={item.name} fill unoptimized className="object-cover" />
                </div>
                <div className="flex-grow flex flex-col justify-center">
                  <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{item.name}</h4>
                  {item.variant && <p className="text-xs text-gray-500">{item.variant}</p>}
                  <p className="text-sm font-bold text-[var(--color-primary)] mt-1">₹{item.price} <span className="text-gray-400 font-normal">x {item.quantity}</span></p>
                </div>
                <button onClick={() => removeItem(item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg self-center transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-500 font-bold">Subtotal</span>
              <span className="text-2xl font-bold text-gray-800">₹{subtotal}</span>
            </div>
            <Link 
              href="/checkout" 
              onClick={toggleCart} // Close drawer when clicking checkout
              className="w-full block text-center bg-[var(--color-primary)] text-white py-4 rounded-xl font-bold hover:bg-[#7fae45] transition-all shadow-lg shadow-[var(--color-primary)]/20"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}